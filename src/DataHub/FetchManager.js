import {
  createUid,
  udFun,
  isNvl,
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

import Component from './Component';

const publicMethods = [
  'fetch',
  'stopFetchByName',
  'hasFetching'
];

const {
  publicMethod
} = Component;

export default class FetchManager extends Component {

  initialization(...args) {
    super.initialization(...args);

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
  fetch(fetcher, data, dataInfo = {}, stop = null) {
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

    return fetchData(fetcher, data, dataInfo, stopKey).catch(err => {
      if (this.destroyed) {
        return;
      }

      if (err === ABORT_REQUEST) {
        this.devLog('abort request: ', fetcher, data, stopKey)
        return;
      }

      return Promise.reject(err);
    }).finally(() => {
      this.stopKeys[stopKey] = null;
    });
  }

  @publicMethod
  stopFetchByName(stop) {
    this.emitter.emit(`$$data:${stop}`);
  }

  @publicMethod
  stopFetch(name) {
    if (this.stopKeys[name]) {
      stopFetchData(this.stopKeys[name]);
      this.stopKeys[name] = null;
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

    clearTimeout(this.fetchingDatastore[name]);
    this.fetchingDatastore[name] = setTimeout(() => {
      if (this.destroyed) {
        return;
      }
      const ds = this.dataHub.getDataStore(name);
      const pagination = ds.paginationManager;

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

      if (!force && ds.isLoading()) {
        this.errLog(`can't fetch ${name} when it is loading`);
        return;
      }

      pagination.stopFetch();
      ds.clearLoading();
      this.stopFetch(this.stopKeys[name]);

      const stopKey = this.stopKeys[name] = createUid('stopKey-');
      if (clear) {
        before();
        ds.clear();
        pagination.setCount(0);
        after();
        return;
      }

      const pagePromise = pagination.fetch(data);
      const pageInfo = pagination.getPageInfo();

      const dataInfo = {
        dataStore: true,
        name,
        ...pageInfo
      };

      before();
      ds.loading();

      let resultData = [];
      let errorMsg = null;

      if (pageInfo.merge) {
        data[pageInfo.pageNumberField] = pagination.page;
        data[pageInfo.pageSizeField] = pagination.size;
      }

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
              ds.clearLoading();
              if (errorMsg !== ABORT_REQUEST) {
                ds.setErrorMsg(errorMsg);
              }
            } else {
              ds.loaded(resultData);
            }
          }
          after();
        });

    }, getRefreshRate());
  }
}

FetchManager.publicMethods = publicMethods;
