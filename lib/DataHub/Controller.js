"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRefreshRate = setRefreshRate;
exports.default = void 0;

var _Utils = require("./../Utils");

var _DataStore = _interopRequireDefault(require("./DataStore.js"));

var _FetchManager = _interopRequireDefault(require("./FetchManager.js"));

var _RunnerManager = _interopRequireDefault(require("./RunnerManager.js"));

var _ListenerManager = _interopRequireDefault(require("./ListenerManager.js"));

var _RelationManager = _interopRequireDefault(require("./RelationManager.js"));

var _Component = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['createController', 'watch', 'isLoading', 'isLocked', 'isWillRefresh', 'getDataHub', 'getController', 'destroy'];
publicMethods.forEach(method => {
  _Utils.udFun[method] = _Utils.udFun;
});
var refreshRate = 40;
var {
  publicMethod
} = _Component.default;

function setRefreshRate(v) {
  refreshRate = v;
}

var Controller = (_class = class Controller extends _Component.default {
  afterCreate(dh) {
    this._dhc = this;
    this._fetchManager = new _FetchManager.default(this, refreshRate, this._devMode);
    this._runnerManager = new _RunnerManager.default(this, this._devMode);
    this._listenerManager = new _ListenerManager.default(this, this._devMode);
    this._publicMethods = {};
    this._watchSet = new Set();
    this._refreshTime = 0;
    this._willRefresh = false;

    this._initPublicMethods();

    this._initWatch();
  }

  beforeDestroy() {
    clearTimeout(this.refreshTimeoutIndex);

    this._fetchManager.destroy();

    this._fetchManager = null;

    this._runnerManager.destroy();

    this._runnerManager = null;

    this._listenerManager.destroy();

    this._fetchManager = null;
    this._watchSet = null;
    this._publicMethods = null;
    this._willRefresh = false;
  }

  _isStatus(names) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'isLoading';

    if ((0, _Utils.isNvl)(names)) {
      return false;
    }

    for (var _name of names) {
      if (this._dh.getDataStore(_name)[type]) {
        return true;
      }
    }

    return false;
  }

  getDataHub() {
    return this._dh;
  }

  getController() {
    return this._dh.getController();
  }

  isLoading(names) {
    return this._isStatus(names, 'isLoading');
  }

  isLocked(names) {
    return this._isStatus(names, 'isLocked');
  }

  isWillRefresh() {
    return this._willRefresh;
  }

  _refresh() {
    if (this._destroyed) {
      return;
    }

    this._willRefresh = false;
    this._refreshTime = Date.now();

    for (var callback of this._watchSet) {
      callback();
    }
  }

  _initWatch() {
    var lagRefresh = () => {
      if (this._destroyed) {
        return;
      }

      clearTimeout(this.refreshTimeoutIndex);
      this._willRefresh = true;

      var time = Date.now() - this._refreshTime;

      if (time > refreshRate * 2) {
        this.devLog('refresh now', time);

        this._refresh();

        return;
      }

      this.refreshTimeoutIndex = setTimeout(() => {
        this.devLog('refresh lag', time);

        this._refresh();
      }, refreshRate);
    };

    var off1 = this._emitter.on('$$data', lagRefresh);

    var off2 = this._emitter.on('$$status', lagRefresh);

    this._emitter.once("$$destroy:Controller:".concat(this._key), () => {
      off1();
      off2();
    });
  }

  _initPublicMethods() {
    // const allPublicMethods = {
    //   _dh: DataStore.publicMethods.concat(RelationManager.publicMethods),
    //   _fetchManager: FetchManager.publicMethods,
    //   _runnerManager: RunnerManager.publicMethods,
    //   _listenerManager: ListenerManager.publicMethods,
    //   'controller': publicMethods
    // };
    this.publicMethods(_DataStore.default.publicMethods, '_dh', this._publicMethods);
    this.publicMethods(_RelationManager.default.publicMethods, '_dh', this._publicMethods);
    this.publicMethods(_FetchManager.default.publicMethods, '_fetchManager', this._publicMethods);
    this.publicMethods(_RunnerManager.default.publicMethods, '_runnerManager', this._publicMethods);
    this.publicMethods(_ListenerManager.default.publicMethods, '_listenerManager', this._publicMethods);
    this.publicMethods(publicMethods, '_that', this._publicMethods); // for (let instanceName in allPublicMethods) {
    //   for (let methodName of allPublicMethods[instanceName]) {
    //     this._publicMethods[methodName] = (...args) => {
    //       if (this._destroyed) {
    //         this.destroyedErrorLog(methodName);
    //         return udFun;
    //       }
    //       if (instanceName === 'controller') {
    //         return this[methodName](...args);
    //       }
    //       return this[instanceName][methodName](...args);
    //     }
    //   }
    // }
  }

  watch() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

    var off = () => {
      if (this._destroyed) {
        return;
      }

      if (!this._watchSet.has(callback)) {
        return;
      }

      this._watchSet.delete(callback);
    };

    this._watchSet.add(callback);

    callback();
    return off;
  }

  fetch() {
    return this._fetchManager.fetch(...arguments);
  }

  createController() {
    return new Controller(this._dh, this._devMode).getPublicMethods();
  }

  getPublicMethods() {
    return _objectSpread({}, this._publicMethods);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "getDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getController"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLocked", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLocked"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isWillRefresh", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isWillRefresh"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "watch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "watch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createController"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getPublicMethods", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPublicMethods"), _class.prototype)), _class);
exports.default = Controller;
Controller.publicMethods = publicMethods.concat(_DataStore.default.publicMethods).concat(_RelationManager.default.publicMethods).concat(_RunnerManager.default.publicMethods).concat(_ListenerManager.default.publicMethods).concat(_FetchManager.default.publicMethods);