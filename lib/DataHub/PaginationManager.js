"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDefaultPageInfo = setDefaultPageInfo;
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

var _Component = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var defaultPageInfo = {
  fetcher: null,
  force: false,
  size: 10,
  start: 1,
  pageNumberField: 'page',
  pageSizeField: 'size',
  merge: true
};
var {
  publicMethod
} = _Component.default;

function setDefaultPageInfo(v) {
  Object.assign(defaultPageInfo, v);
}

var PaginationManager = (_class = class PaginationManager extends _Component.default {
  initialization() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    super.initialization(...args);
    var [dataStore] = args;
    this.name = dataStore.name;
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

  init(param) {
    if ((0, _Utils.isNvl)(param) || param === false) {
      this.inited = true;
      this.noPage = true;
      return;
    }

    if (param === true) {
      param = {};
    }

    this.config = Object.assign({}, defaultPageInfo, param);
    this.inited = true;
    this.pageInfo = {
      count: 0,
      page: this.config.start,
      size: this.config.size
    };
  }

  setCount(v) {
    this.pageInfo.count = v;
  }

  getCount() {
    return this.pageInfo.count;
  }

  stopFetch() {
    if (this.stopKey) {
      (0, _Fetcher.stopFetchData)(this.stopKey);
      this.stopKey = null;
    }
  }

  fetch() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var fakeResolve = Promise.resolve();

    if (this.config.fetcher === null) {
      this.emitter.emit('$$data', {
        name: "$$count:".concat(this.name),
        value: this.pageInfo.count
      });
      return fakeResolve;
    }

    this.stopFetch();

    if ((0, _Utils.isNvl)(data)) {
      data = {};
    }

    var willFetch = null;

    if (typeof this.config.willFetch === 'function') {
      willFetch = this.config.willFetch(data);
    }

    if (willFetch === false) {
      return fakeResolve;
    }

    if ((0, _Utils.isNvl)(willFetch)) {
      var stringData = (0, _Utils.uniStringify)(data);

      if (!(0, _Utils.isNvl)(stringData) && stringData === this.stringData) {
        this.devLog("same data", stringData);

        if (!this.force) {
          return fakeResolve;
        }

        this.devLog("same data but force fetch");
      }

      this.stringData = stringData;
    }

    this.setPageInfo(1);
    var stopKey = this.stopKey = (0, _Utils.createUid)('pageStopKey-'); // name, data = null, dataInfo = {}, stopKey = null

    return (0, _Fetcher.fetchData)(this.config.fetcher, data, {
      name: this.name,
      pagination: true
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
      this.devLog("'".concat(this.name, "' count is ").concat(this.count));
      this.emitter.emit('$$data', {
        name: "$$count:".concat(this.name),
        value: result
      });
    }).catch(err => {
      if (err === _Fetcher.NOT_INITfetcher) {
        this.devLog && this.devLog('must init fetcher first');
        return;
      }

      if (err === _Fetcher.NOT_ADD_FETCH) {
        this.devLog && this.devLog("must add fetcher '".concat(this.fetcher, "' first"));
        return;
      }

      if (err === _Fetcher.ABORT_REQUEST) {
        return;
      }

      return Promise.reject(err);
    });
  }

  setPageInfo(pageNumber, pageSize) {
    var changed = false;

    if (!(0, _Utils.isNvl)(pageNumber) && pageNumber !== this.pageInfo.page) {
      this.pageInfo.page = pageNumber;
      changed = true;
    }

    if (!(0, _Utils.isNvl)(pageSize) && pageSize !== this.pageInfo.size) {
      this.pageInfo.size = pageSize;
      changed = true;
    }

    if (changed) {
      this.emitter.emit('$$data', {
        name: "$$page:".concat(this.name)
      });
    }
  }

  getPageInfo() {
    if (this.noPage) {
      return {
        hasPagiNation: false
      };
    }

    return _objectSpread({
      hasPagiNation: true
    }, this.pageInfo, {}, this.config);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "init", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "init"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setCount", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setCount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getCount", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getCount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "stopFetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "stopFetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setPageInfo", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setPageInfo"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getPageInfo", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPageInfo"), _class.prototype)), _class);
exports.default = PaginationManager;