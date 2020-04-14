import {
  createUid,
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
  fetchStoreData(param = {}) {
    const {
      name = null,
        data = {},
        clear = false,
        force = false,
        before = udFun,
        after = udFun,
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
          resultField = 'value',
          countField = 'total',
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
      }, stopKey);
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

      if (pageInfo.pagiNationConfig.merge) {
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

              if (hasPagiNation && !hasFetcher && !isNvl(resultData) && typeof resultData === 'object') {

                const result = resultData[resultField];
                const count = resultData[countField] || 0;

                ds.loaded(result, stopKey);
                pagination.setCount(count);

              } else {
                ds.loaded(resultData, stopKey);
              }
            }
          }
          after();
        });

    }

    this.fetchingDatastore[name] = setTimeout(doFetch, getRefreshRate());
  }
}

FetchManager.publicMethods = publicMethods;
