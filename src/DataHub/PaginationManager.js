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
  size: 10,
  start: 1,
  pageNumberField: 'page',
  pageSizeField: 'size',
  resultField: 'data',
  countField: 'total',
  merge: true,
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
    this.noPage = false;

    this.pageInfo = {};

  }

  destruction() {
    super.destruction();

    this.pageInfo = null;
    this.config = null;
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
    }

    this.config = Object.assign({}, defaultPageConfig, param);

    this.inited = true;

    this.pageInfo = {
      pageCount: 0,
      count: 0,
      page: this.config.start,
      size: this.config.size,
    };

  }

  @publicMethod
  setCount(v) {
    v = +v || 0;

    this.pageInfo.count = v;

    let pageCount = v / this.pageInfo.size;

    if (pageCount !== parseInt(pageCount)) {
      pageCount++;
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
    }
  }

  @publicMethod
  fetch(data = {}, loadingKey) {
    const fakeResolve = Promise.resolve();

    if (isNvl(this.config.fetcher)) {
      this.emitter.emit('$$data', {
        name: `$$count:${this.name}`,
        value: this.pageInfo.count
      });
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
      return fakeResolve;
    }

    if (isNvl(willFetch)) {
      let stringData = uniStringify(data);

      if (!isNvl(stringData) && stringData === this.stringData) {
        this.devLog(`same data`, stringData);
        if (!this.force) {
          return fakeResolve;
        }
        this.devLog(`same data but force fetch`);
      }

      this.stringData = stringData;
    }

    this.pageInfo.page = this.config.start;

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

      this.emitter.emit('$$data', {
        name: `$$count:${this.name}`,
        value: result
      });
    }).catch((err) => {
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
    });
  }

  @publicMethod
  setPageInfo(pageNumber, pageSize) {
    if (this.noPage) {
      return;
    }

    let changed = false;

    if (!isNvl(pageNumber) && pageNumber !== this.pageInfo.page) {
      this.pageInfo.page = pageNumber;
      changed = true;
    }

    if (!isNvl(pageSize) && pageSize !== this.pageInfo.size) {
      // this.pageInfo.page = this.config.start;
      this.pageInfo.size = pageSize;
      changed = true;
    }

    if (changed) {
      this.emitter.emit('$$page', {
        name: this.name,
        value: this.pageInfo
      });

      this.emitter.emit(`$$page:${this.storeName}`, this.pageInfo);

      this.emitter.emit('$$model', {
        src: this,
        type: '$$page',
        name: this.name,
        value: this.pageInfo
      });
    }
  }

  @publicMethod
  getPageInfo() {
    return {
      hasPagiNation: !this.noPage,
      hasFetcher: !isNvl(this.config.fetcher),
      pagiNationConfig: {
        ...this.config
      },
      ...this.pageInfo,
    };
  }
}
