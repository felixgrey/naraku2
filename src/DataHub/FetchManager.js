import {
  createUid,
  mergeObject,
  udFun,
  isNvl,
  snapshot,
} from './../Utils';

import {
  ABORT_REQUEST,
  stopFetchData,
  fetchData,
  hasFetching
} from './Fetcher';

import {
  getRefreshRate
} from '../Common/Union';

import Timer from '../Common/Timer';

import Component from './Component';

const publicMethods = [
  'fetch',
  'stopFetchByName',
  'stopFetch',
  'hasFetching'
];

const {
  publicMethod
} = Component;

export default class FetchManager extends Component {

  initialization(...args) {
    super.initialization(...args);
    const [dataHubController] = args;
    this.dataHubController = dataHubController;

    this.fetchingDatastore = {};
    this.stopKeys = {};
  }

  destruction() {
    super.destruction();

    Object.values(this.stopKeys).forEach(key => {
      stopFetchData(key);
    });
    this.stopKeys = null;

    Object.values(this.fetchingDatastore).forEach(index => {
      clearTimeout(index);
    });
    this.fetchingDatastore = null;
  }

  @publicMethod
  hasFetching() {
    return hasFetching();
  }

  @publicMethod
  fetch(fetcher, data, dataInfo = null, stop = null, extendOnce) {
    const stopKey = createUid('stopKey-');
    this.stopKeys[stopKey] = stopKey;

    let doStop = () => {
      this.devLog(`stop fetch  `, fetcher, data, stopKey);
      this.stopFetch(stopKey);
    };

    this.emitter.once(`$$destroy:${this.clazz}=${this.key}`, doStop);
    if (typeof stop === 'string') {
      this.emitter.once(`$$data:${stop}`, doStop);
    } else if (typeof stop === 'function') {
      stop(doStop);
    }

    Timer.refreshView(this.dataHubController.dhKey);

    return fetchData(fetcher, data, { ...dataInfo
    }, stopKey, extendOnce).catch(err => {
      if (this.destroyed) {
        return;
      }

      if (err === ABORT_REQUEST) {
        this.devLog('abort request: ', fetcher, data, stopKey)
        return;
      }

      return Promise.reject(err);
    }).finally(() => {
      if (this.destroyed) {
        return;
      }

      Timer.refreshView(this.dataHubController.dhKey);

      this.stopKeys[stopKey] = null;
    });
  }

  @publicMethod
  stopFetchByName(stop) {
    this.emitter.emit(`$$data:${stop}`);
  }

  @publicMethod
  stopFetch(name, isStore = false) {
    if (isNvl(name)) {
      return;
    }

    if (this.stopKeys[name]) {
      stopFetchData(this.stopKeys[name]);
      this.stopKeys[name] = null;
    }

    if (isStore) {
      const ds = this.dataHub.getDataStore(name);
      const pagination = ds.paginationManager;
      ds.clearLoading(this.stopKeys[name]);
      pagination.stopFetch(this.stopKeys[name]);
    }

    if (this.fetchingDatastore[name]) {
      clearTimeout(this.fetchingDatastore[name]);
      this.fetchingDatastore[name] = null;
    }
  }

  @publicMethod
  parseExtendUrl(extendUrl) {

    if (isNvl(extendUrl)) {
      return extendUrl;
    }

    let storeNames = null;
    let type = 'query';
    let format = null;

    if (typeof extendUrl === 'string' || Array.isArray(extendUrl)) {
      storeNames = [].concat(extendUrl);
    } else if (extendUrl.hasOwnProperty('query')) {
      let query = extendUrl.query;
      if (typeof query === 'string' || Array.isArray(query)) {
        storeNames = [].concat(query);
      }
    } else if (extendUrl.hasOwnProperty('store')) {
      type = extendUrl.type || 'query';
      format = extendUrl.format;
      storeNames = [].concat(extendUrl.store);
    }

    if (storeNames) {
      const param = storeNames.reduce((paramData, name) => {
        return mergeObject(paramData, this.dataHub.getDataStore(name).first())
      }, {});

      extendUrl = {
        type,
        param,
        format,
      }
    }

    return extendUrl;
  }

  @publicMethod
  fetchStoreData(param = {}, refresh = false, ) {
    const {
      name = null,
        data = {},
        clear = false,
        force = false,
        before = udFun,
        after = udFun,
    } = param;

    let {
      extendUrl = null,
    } = param;

    if (isNvl(name)) {
      return;
    }

    clearTimeout(this.fetchingDatastore[name]);

    const ds = this.dataHub.getDataStore(name);
    const pagination = ds.paginationManager || {};

    if (force && ds.isLoading()) {
      this.stopFetch(name, true);
      ds.clearLoading(ds.loadingKey);

      if (pagination.loadingPage) {
        pagination.stopFetch(pagination.loadingKey);
      }
    }

    const doFetch = () => {
      if (this.destroyed) {
        return;
      }

      const {
        fetcher = null
      } = ds.getStoreConfig();

      if (!fetcher) {
        this.devLog(`fetchStoreData failed: store=${name} no fetcher.`);
        return;
      }

      if (ds.isLocked()) {
        this.errLog(`can't fetch ${name} when it is locked`);
        return;
      }

      if (!force && ds.isLoading(true, false)) {
        this.errLog(`can't fetch ${name} when it is loading`);
        return;
      }

      const {
        hasFetcher,
        hasPagiNation,
        pagiNationConfig: {
          resultField = null,
          countField = null,
        } = {},
      } = pagination.getPageInfo() || {};

      if (clear) {
        before();
        ds.clear();
        pagination.setCount(0);
        after();
        return;
      }

      const stopKey = this.stopKeys[name] = createUid(`dataStore-${name}-stopKey`);
      let pagePromise = pagination.fetch({
        ...data
      }, refresh, stopKey);
      const pageInfo = pagination.getPageInfo();

      if (!pageInfo.pagiNationConfig.allReady) {
        pagePromise = Promise.resolve();
      }

      const dataInfo = {
        dataStore: true,
        name,
        ...pageInfo
      };

      before();
      ds.loading(stopKey);

      let resultData = [];
      let errorMsg = null;

      if (pageInfo.hasPagiNation && pageInfo.pagiNationConfig.merge) {
        data[pageInfo.pagiNationConfig.pageNumberField] = pageInfo.page;
        data[pageInfo.pagiNationConfig.pageSizeField] = pageInfo.size;

        if (pageInfo.pagiNationConfig.sortFieldField !== null) {
          data[pageInfo.pagiNationConfig.sortFieldField] = pageInfo.sortField;
        }

        if (pageInfo.pagiNationConfig.sortTypeField !== null) {
          data[pageInfo.pagiNationConfig.sortTypeField] = pageInfo.sortType;
        }
      }

      ds.lastFetchParam = snapshot(data);

      dataInfo.extendUrl = this.parseExtendUrl(extendUrl);

      // fetcher, data = null, dataInfo = {}, stopKey = null
      const dataPromise = fetchData(fetcher, data, dataInfo, stopKey)
        .then(result => {
          resultData = result;
        })
        .catch(err => {
          errorMsg = err
        });

      Promise
        .all([dataPromise, pagePromise])
        .finally(() => {
          if (!this.destroyed) {
            this.stopKeys[name] = null;
            if (errorMsg !== null) {
              if (errorMsg !== ABORT_REQUEST) {
                ds.setErrorMsg(errorMsg);
                ds.clearLoading(stopKey);
              }
            } else {

              let result = resultData;

              if (hasPagiNation && !isNvl(resultData) && typeof resultData === 'object') {

                if (!hasFetcher && !isNvl(countField) && countField !== false) {
                  pagination.setCount(resultData[countField] || 0);
                }

                if (!isNvl(resultField) && resultField !== false) {
                  resultData = resultData[resultField]
                }
              }

              ds.loaded(resultData, stopKey);
            }
          }
          after();
        });

    }

    this.fetchingDatastore[name] = setTimeout(doFetch, getRefreshRate());
  }
}

FetchManager.publicMethods = publicMethods;
