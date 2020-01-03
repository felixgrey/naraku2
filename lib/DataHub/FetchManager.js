"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var publicMethods = ['fetch'];
var {
  publicMethod
} = _Component.default;
var FetchManager = (_class = class FetchManager extends _Component.default {
  afterCreate(dhc) {
    var refreshRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 40;

    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    this._fetchingDatastore = {};
    this._stopKeys = {};
    this._refreshRate = refreshRate;
  }

  beforeDestroy() {
    Object.values(this._stopKeys).forEach(key => {
      (0, _Fetcher.stopFetchData)(key);
    });
    this._stopKeys = null;
    Object.values(this._fetchingDatastore).forEach(index => {
      clearTimeout(index);
    });
    this._fetchingDatastore = null;
  }

  fetch(fetcher, data) {
    var dataInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var stop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var stopKey = (0, _Utils.createUid)('stopKey-');
    this._stopKeys[stopKey] = stopKey;

    var doStop = () => {
      this.devLog("stop fetch  ", fetcher, data, stopKey);
      this.stopFetch(stopKey);
    };

    this._emitter.once("$$destroy:FetchManager:".concat(this._key), doStop);

    if (typeof stop === 'string') {
      this._emitter.once("$$data:".concat(stop), doStop);
    } else if (typeof stop === 'function') {
      stop(doStop);
    }

    return (0, _Fetcher.fetchData)(fetcher, data, dataInfo, stopKey).catch(err => {
      if (this._destroyed) {
        return;
      }

      if (err === _Fetcher.ABORT_REQUEST) {
        this.devLog('abort request: ', fetcher, data, stopKey);
        return;
      }

      return Promise.reject(err);
    });
  }

  stopFetch(name) {
    if (this._stopKeys[name]) {
      (0, _Fetcher.stopFetchData)(this._stopKeys[name]);
      this._stopKeys[name] = null;
    }

    if (this._fetchingDatastore[name]) {
      clearTimeout(this._fetchingDatastore[name]);
      this._fetchingDatastore[name] = null;
    }
  }

  fetchStoreData() {
    var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var {
      name = null,
      data = {},
      clear = false,
      force = false,
      before = _Utils.udFun,
      after = _Utils.udFun
    } = param;
    clearTimeout(this._fetchingDatastore[name]);
    this._fetchingDatastore[name] = setTimeout(() => {
      if (this._destroyed) {
        return;
      }

      var ds = this._dh.getDataStore(name);

      var pagination = ds.getPaginationManager();
      var {
        fetcher = null
      } = ds.getStoreConfig();

      if (!fetcher) {
        this.devLog("fetchStoreData failed: store=".concat(name, " no fetcher."));
        return;
      }

      if (ds.isLocked()) {
        this.errLog("can't fetch ".concat(name, " when it is locked"));
        return;
      }

      if (!force && ds.isLoading()) {
        this.errLog("can't fetch ".concat(name, " when it is loading"));
        return;
      }

      pagination.stopFetch();
      ds.clearLoading();
      this.stopFetch(this._stopKeys[name]);
      var stopKey = this._stopKeys[name] = (0, _Utils.createUid)('stopKey-');

      if (clear) {
        before();
        ds.clear();
        pagination.setCount(0);
        after();
        return;
      }

      var pagePromise = pagination.fetch(data);

      var dataInfo = _objectSpread({
        dataStore: true,
        name
      }, pagination.getPageInfo());

      before();
      ds.loading();
      var resultData = [];
      var errorMsg = null; // fetcher, data = null, dataInfo = {}, stopKey = null

      var dataPromise = (0, _Fetcher.fetchData)(fetcher, data, dataInfo, stopKey).then(result => {
        resultData = result;
      }).catch(err => {
        errorMsg = err;
      });
      Promise.all([dataPromise, pagePromise]).finally(() => {
        if (!this._destroyed) {
          if (errorMsg !== null) {
            ds.clearLoading();

            if (errorMsg !== _Fetcher.ABORT_REQUEST) {
              ds.setErrorMsg(errorMsg);
            }
          } else {
            ds.loaded(resultData);
          }
        }

        after();
      });
    }, this._refreshRate);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "stopFetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "stopFetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetchStoreData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetchStoreData"), _class.prototype)), _class);
exports.default = FetchManager;
FetchManager.publicMethods = publicMethods;