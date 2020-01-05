"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataHub = exports.default = void 0;

var _Utils = require("./../Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

var _DataStore = _interopRequireDefault(require("./DataStore"));

var _Controller = _interopRequireDefault(require("./Controller"));

var _LifeCycle = _interopRequireDefault(require("../Common/LifeCycle"));

var _RelationManager = _interopRequireDefault(require("./RelationManager"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var DataHub = (_class = class DataHub extends _LifeCycle.default {
  afterCreate(dh, cfg) {
    this._cfg = cfg || {};
    this._dh = this;
    this._emitter = new _Emitter.default(this.devLog, this.errLog, this._devMode);
    this._dhc = new _Controller.default(this, this.devLog, this.errLog, this._devMode);
    this._dataCenter = {};
    this._extendConfig = {};
    this._runner = {};

    this._initDsPublicMethods();

    this._init();
  }

  beforeDestroy() {
    Object.values(this._dataCenter).forEach(ds => ds.destroy());
    this._dataCenter = null;

    this._dhc.destroy();

    this._dhc = null;
    this._runner = null;
  }

  destroy() {
    var _emitter = this._emitter;
    super.destroy();

    _emitter.destroy();
  }

  _init() {
    for (var name in this._cfg) {
      if (/\_|\$/g.test(name.charAt(0))) {
        this._extendConfig[name] = this._cfg[name];
        continue;
      }

      this.getDataStore(name).setConfig(this._cfg[name]);
    }
  }

  _initDsPublicMethods() {
    var _this = this;

    _RelationManager.default.publicMethods.concat(_DataStore.default.publicMethods).forEach(methodName => {
      this[methodName] = function (name) {
        if (_this._destroyed) {
          _this.destroyedErrorLog(methodName);

          return _Utils.udFun;
        }

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return _this.getDataStore(name)[methodName](...args);
      };
    });
  }

  getDataStore(name) {
    if (!this._dataCenter[name]) {
      this._dataCenter[name] = new _DataStore.default(this, name, this.devLog, this.errLog, this._devMode);
    }

    return this._dataCenter[name];
  }

  getController() {
    if (this._destroyed) {
      this.destroyedErrorLog('getController');
      return _Utils.udFun;
    }

    return this._dhc.getPublicMethods();
  }

}, (_applyDecoratedDescriptor(_class.prototype, "getDataStore", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getDataStore"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getController"), _class.prototype)), _class);
exports.DataHub = exports.default = DataHub;
var globalDataHub = new DataHub({}, _Utils.udFun, _Utils.udFun, false);
var globalMethods = globalDataHub.getController();
DataHub.globalDataHub = globalDataHub;
Object.keys(globalMethods).forEach(method => {
  DataHub[method] = function () {
    return globalMethods[method](...arguments);
  };
});