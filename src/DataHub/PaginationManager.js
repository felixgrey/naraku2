import {
  createUid,
  isNvl,
  uniStringify,
} from './../Utils';

import {
  NOT_INITfetcher,
  NOT_ADD_FETCH,
  ABORT_REQUEST,
  stopFetchData,
  fetchData,
} from './Fetcher';

import Component from './Component';

let defaultPageConfig = {
  fetcher: null,
  force: false,
  restart: true,
  size: 10,
  start: 1,
  pageNumberField: 'page',
  pageSizeField: 'size',
  resultField: 'data',
  countField: 'total',
  sortFieldField: null,
  sortTypeField: null,
  merge: true,
  allReady: false,
};

const {
  publicMethod
} = Component;

export function setDefaultPageConfig(v) {
  Object.assign(defaultPageConfig, v);
}

export default class PaginationManager extends Component {

  initialization(...args) {
    super.initialization(...args);

    const [dataStore] = args;

    this.name = dataStore.name;
    this.storeName = dataStore.storeName;

    this.stringData = '';
    this.config = {};

    this.stopKey = null;
    this.noPage = true;

    this.pageInfo = {};
    this.loadingPage = false;

  }

  destruction() {
    super.destruction();

    this.pageInfo = null;
    this.config = null;
    this.loadingPage = false;
  }


  @publicMethod
  init(param) {
    if (isNvl(param) || param === false) {
      this.inited = true;
      this.noPage = true;
      return;
    }

    if (param === true) {
      param = {};
    } else if (typeof param === 'string') {
      param = {
        fetcher: param
      };
    }

    this.config = Object.assign({}, defaultPageConfig, param);

    this.inited = true;
    this.noPage = false;

    this.pageInfo = {
      pageCount: 0,
      count: 0,
      page: this.config.start,
      size: this.config.size,
      sortField: null,
      sortType: null,
    };

  }

  @publicMethod
  setCount(v) {
    v = +v || 0;

    this.pageInfo.count = v;

    let pageCount = v / this.pageInfo.size;

    const intCount = parseInt(pageCount);
    if (pageCount !== intCount) {
      pageCount = intCount + 1;
    }

    this.pageInfo.pageCount = pageCount;
  }


  @publicMethod
  stopFetch(loadingKey) {
    if (!isNvl(loadingKey) && !isNvl(this.loadingKey) && loadingKey !== this.loadingKey) {
      return;
    }

    if (this.stopKey) {
      stopFetchData(this.stopKey);
      this.stopKey = null;
      this.loadingPage = false;
    }
  }

  @publicMethod
  fetch(data = {}, loadingKey) {
    this.loadingPage = true;

    const fakeResolve = Promise.resolve();

    const stringData = uniStringify(data);
    const sameData = stringData === this.stringData;

    this.stringData = stringData;

    if (isNvl(this.config.fetcher)) {
      this.loadingPage = false;

      if ((!sameData) && this.config.restart) {
        this.pageInfo.page = this.config.start;
      }

      return fakeResolve;
    }

    this.loadingKey = loadingKey;

    if (isNvl(data)) {
      data = {};
    }

    let willFetch = null;
    if (typeof this.config.willFetch === 'function') {
      willFetch = this.config.willFetch(data);
    }

    if (willFetch === false) {
      this.loadingPage = false;
      return fakeResolve;
    }

    if (isNvl(willFetch)) {
      let stringData = uniStringify(data);
      if (sameData) {
        this.devLog(`same data`, stringData);

        if (!this.config.force) {
          this.loadingPage = false;
          return fakeResolve;
        }

        this.devLog(`same data but force fetch`);
      }
    }

    if (this.config.restart) {
      this.pageInfo.page = this.config.start;
    }

    const stopKey = this.stopKey = createUid('pageStopKey-');

    // name, data = null, dataInfo = {}, stopKey = null
    return fetchData(this.config.fetcher, data, {
      name: this.name,
      pagination: true,
    }, stopKey).then(result => {
      if (this.destroyed) {
        return;
      }

      this.devLog('result is ', result);

      if (isNaN(+result)) {
        this.errLog('data count must be Number, but it is: ', result);
        result = 0;
      }

      this.pageInfo.count = +result;

      this.devLog(`'${this.name}' count is ${this.count}`);

    }).catch((err) => {
      this.loadingPage = false;

      if (err === NOT_INITfetcher) {
        this.devLog && this.devLog('must init fetcher first');
        return;
      }

      if (err === NOT_ADD_FETCH) {
        this.devLog && this.devLog(`must add fetcher '${this.fetcher}' first`);
        return;
      }

      if (err === ABORT_REQUEST) {
        return;
      }

      return Promise.reject(err);
    }).finally(a => {
      this.loadingPage = false;

      this.emitPageInfo(true);
    });
  }

  @publicMethod
  setPageInfo(pageNumber = false, pageSize = false, sortField = false, sortType = false) {
    if (this.noPage) {
      return;
    }

    let changed = false;

    if (!isNvl(pageNumber) && pageNumber !== false && pageNumber !== this.pageInfo.page) {
      this.pageInfo.page = pageNumber;
      changed = true;
    }

    if (!isNvl(pageSize) && pageSize !== false && pageSize !== this.pageInfo.size) {
      this.pageInfo.size = pageSize;
      changed = true;
    }

    if (sortField !== false && uniStringify(sortField) !== uniStringify(this.pageInfo.sortField)) {
      this.pageInfo.sortField = sortField;
      changed = true;
    }

    if (sortField !== false && uniStringify(sortType) !== uniStringify(this.pageInfo.sortType)) {
      this.pageInfo.sortType = sortType;
      changed = true;
    }

    // console.log(this.pageInfo, pageNumber, pageSize, sortField, sortType)

    if (changed) {
      this.emitPageInfo();
    }
  }

  emitPageInfo(justModel = false) {
    const pageInfo = this.getPageInfo();

    if (!justModel) {
      this.emitter.emit('$$page', {
        name: this.name,
        value: pageInfo
      });
      this.emitter.emit(`$$page:${this.storeName}`, pageInfo);
    }

    this.emitter.emit('$$model', {
      src: this,
      type: '$$page',
      name: this.storeName,
      value: pageInfo
    });
  }

  @publicMethod
  getPageInfo() {

    return {
      hasPagiNation: !this.noPage,
      hasFetcher: !isNvl(this.config.fetcher),
      loading: this.loadingPage,
      pagiNationConfig: {
        ...this.config
      },
      ...this.pageInfo,
    };
  }
}
