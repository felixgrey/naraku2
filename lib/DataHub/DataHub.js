"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataHub = exports.default = void 0;

var _Utils = require("./../Utils");

var _Union = _interopRequireDefault(require("../Common/Union.js"));

var _Emitter = _interopRequireDefault(require("../Common/Emitter.js"));

var _Container = _interopRequireDefault(require("./Container"));

var _DataStore = _interopRequireDefault(require("./DataStore"));

var _Controller = _interopRequireDefault(require("./Controller"));

var _RelationManager = _interopRequireDefault(require("./RelationManager"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _Container.default;
var DataHub = (_class = class DataHub extends _Container.default {
  initialization() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    super.initialization(...args);
    var [cfg] = args;
    this.cfg = cfg || {};
    this.dataHub = this;
    this.newEmitter = false;

    if (!(this.emitter instanceof _Emitter.default)) {
      // this.devLog('new Emitter', this.emitter);
      this.emitter = new _Emitter.default(this.union);
      this.newEmitter = true;
    }

    this.dataHubController = new _Controller.default(this, this.union);
    this.dataCenter = {};
    this.initDsPublicMethods();
    this.init();
  }

  bindContainer(instance) {
    super.bindContainer(instance);
    instance.dataHub = this;
  }

  destruction() {
    super.destruction();
    Object.values(this.dataCenter).forEach(ds => ds.destroy());
    this.dataCenter = null;
    this.dataHubController && this.dataHubController.destroy();
    this.dataHubController = null;
  }

  destroy() {
    var emitter = this.emitter;
    super.destroy();
    this.newEmitter && emitter.destroy();
  }

  init() {
    for (var name in this.cfg) {
      if (/\_|\$/g.test(name.charAt(0))) {
        this.setData(name, this.cfg[name]);
        continue;
      }

      this.getDataStore(name).setConfig(this.cfg[name]);
    }
  }

  initDsPublicMethods() {
    var _this = this;

    [].concat(_RelationManager.default.publicMethods).concat(_DataStore.default.publicMethods).forEach(methodName => {
      this[methodName] = function (name) {
        if (_this.destroyed) {
          _this.destroyedErrorLog(methodName);

          return _Utils.udFun;
        }

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        return _this.getDataStore(name)[methodName](...args);
      };
    });
  }

  getDataStore(name) {
    this.devLog('getDataStore', name);

    if (!this.dataCenter[name]) {
      this.dataCenter[name] = new _DataStore.default(this, name, this.union);
    }

    return this.dataCenter[name];
  }

  getController() {
    if (!this.dataHubController) {
      return _Utils.udFun;
    }

    return this.dataHubController.getPublicMethods();
  }

}, (_applyDecoratedDescriptor(_class.prototype, "getDataStore", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getDataStore"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getController"), _class.prototype)), _class);
exports.DataHub = exports.default = DataHub;
// console.log(Union.getDevMode());
var union = new _Union.default({
  devLog: (0, _Utils.createLog)('global', 'log'),
  errLog: (0, _Utils.createLog)('global', 'error')
});
var globalDataHub = new DataHub({}, union);
var globalMethods = globalDataHub.getController();
DataHub.globalDataHub = globalDataHub;
Object.keys(globalMethods).forEach(method => {
  if (method === 'destroy') {
    return;
  }

  DataHub[method] = function () {
    return globalMethods[method](...arguments);
  };
});

DataHub.getGlobalUnion = () => union.clone();

DataHub.create = function () {
  var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var logName = (0, _Utils.isNvl)(cfg.$logName) ? 'DataHub' : cfg.$logName;
  var union = new _Union.default({
    devLog: (0, _Utils.createLog)(logName, 'log'),
    errLog: (0, _Utils.createLog)(logName, 'error')
  });
  return new DataHub({}, union);
};