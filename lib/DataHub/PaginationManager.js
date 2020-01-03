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

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var defaultPageInfo = {
  force: false,
  page: 1,
  size: 10,
  start: 1
};
var {
  publicMethod
} = _Component.default;

function setDefaultPageInfo(v) {
  Object.assign(defaultPageInfo, v);
}

var PaginationManager = (_class = class PaginationManager extends _Component.default {
  afterCreate(store) {
    this._name = store._name;
    this._fetcher = null;
    this._stringData = '';
    this._force = defaultPageInfo.force;
    this._pageSize = defaultPageInfo.size;
    this._pageNumber = defaultPageInfo.page;
    this._startPage = defaultPageInfo.start;
    this._stopKey = null;
    this._noPage = false;
    this._count = 0;
  }

  beforeDestroy() {}

  init(param) {
    if ((0, _Utils.isNvl)(param) || param === false) {
      this._inited = true;
      this._noPage = true;
      return;
    }

    if (param === true) {
      param = {};
    }

    var {
      fetcher = null,
      force = defaultPageInfo.force,
      startPage = defaultPageInfo.start,
      pageSize = defaultPageInfo.size
    } = param;
    this._inited = true;
    this._fetcher = fetcher;
    this._force = force;
    this._startPage = startPage;
    this._pageSize = pageSize;
  }

  setCount(v) {
    this._count = v;
  }

  getCount() {
    return this._count;
  }

  stopFetch() {
    if (this._stopKey) {
      (0, _Fetcher.stopFetchData)(this._stopKey);
      this._stopKey = null;
    }
  }

  fetch() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (this._fetcher === null) {
      this._emitter.emit('$$data', {
        name: "$$count:".concat(this._name),
        value: this._count
      });

      return Promise.resolve();
    }

    if ((0, _Utils.isNvl)(data)) {
      data = {};
    }

    this.stopFetch();
    var stringData = (0, _Utils.uniStringify)(data);

    if (!(0, _Utils.isNvl)(stringData) && stringData === this._stringData) {
      this.devLog("same data", stringData);

      if (!this._force) {
        return;
      }

      this.devLog("same data but force fetch");
    }

    this._stringData = stringData;
    this.setPageInfo(1);
    var stopKey = this._stopKey = (0, _Utils.createUid)('pageStopKey-'); // name, data = null, dataInfo = {}, stopKey = null

    return (0, _Fetcher.fetchData)(this._fetcher, data, {
      name: this._name,
      pagination: true
    }, stopKey).then(result => {
      if (this._destroyed) {
        return;
      }

      this.devLog('result is ', result);

      if (isNaN(+result)) {
        this.errLog('data count must be Number, but it is: ', result);
        result = 0;
      }

      this._count = +result;
      this.devLog("'".concat(this._name, "' count is ").concat(this._count));

      this._emitter.emit('$$data', {
        name: "$$count:".concat(this._name),
        value: result
      });
    }).catch(err => {
      if (err === _Fetcher.NOT_INIT_FETCHER) {
        this.devLog && this.devLog('must init fetcher first');
        return;
      }

      if (err === _Fetcher.NOT_ADD_FETCH) {
        this.devLog && this.devLog("must add fetcher '".concat(this._fetcher, "' first"));
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

    if (!(0, _Utils.isNvl)(pageNumber) && pageNumber !== this._pageNumber) {
      this._pageNumber = pageNumber;
      changed = true;
    }

    if (!(0, _Utils.isNvl)(pageSize) && pageSize !== this._pageSize) {
      this._pageSize = pageSize;
      changed = true;
    }

    if (changed) {
      this._emitter.emit('$$data', {
        name: "$$page:".concat(this._name)
      });
    }
  }

  getPageInfo() {
    if (this._noPage) {
      return {
        hasPagiNation: false
      };
    }

    return {
      hasPagiNation: true,
      count: this._count,
      page: this._pageNumber,
      size: this._pageSize,
      start: this._startPage
    };
  }

}, (_applyDecoratedDescriptor(_class.prototype, "init", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "init"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setCount", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setCount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getCount", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getCount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "stopFetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "stopFetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setPageInfo", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setPageInfo"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getPageInfo", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPageInfo"), _class.prototype)), _class);
exports.default = PaginationManager;