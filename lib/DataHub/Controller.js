"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _DataStore = _interopRequireDefault(require("./DataStore.js"));

var _FetchManager = _interopRequireDefault(require("./FetchManager.js"));

var _RunnerManager = _interopRequireDefault(require("./RunnerManager.js"));

var _ListenerManager = _interopRequireDefault(require("./ListenerManager.js"));

var _RelationManager = _interopRequireDefault(require("./RelationManager.js"));

var _Container = _interopRequireDefault(require("./Container"));

var _Component = _interopRequireDefault(require("./Component"));

var _Timer = _interopRequireDefault(require("../Common/Timer"));

var _Union = require("../Common/Union");

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['createController', 'isLoading', 'isLocked', 'getDataHub', 'getController'];
var {
  publicMethod
} = _Container.default;
var Controller = (_class = class Controller extends _Container.default {
  initialization() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    super.initialization(...args);
    var [dataHub] = args;
    this.dataHubController = this;
    this.dataHub = dataHub;
    this.fetchManager = new _FetchManager.default(this, this.union);
    this.runnerManager = new _RunnerManager.default(this, this.union);
    this.listenerManager = new _ListenerManager.default(this, this.union);
    this.controllerPublicMethods = {};
    this.containerDestroyOff = _Component.default.prototype.bindContainer.bind(this)(dataHub);
    this.initPublicMethods();
    this.initWatch();
  }

  bindContainer(instance) {
    super.bindContainer(instance);
    instance.dataHub = this.dataHub;
    instance.dataHubController = this;
  }

  destruction() {
    super.destruction();
    clearTimeout(this.lagEmitTimeoutIndex);
    clearTimeout(this.refreshTimeoutIndex);
    this.fetchManager.destroy();
    this.fetchManager = null;
    this.runnerManager.destroy();
    this.runnerManager = null;
    this.listenerManager.destroy();
    this.fetchManager = null;
    this.containerDestroyOff();
    this.containerDestroyOff = null;
    this.controllerPublicMethods = null;
  }

  isStatus(names) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'isLoading';

    if ((0, _Utils.isNvl)(names)) {
      return false;
    }

    for (var name of names) {
      if (this.dataHub.getDataStore(name)[type]) {
        return true;
      }
    }

    return false;
  }

  getDataHub() {
    return this.dataHub;
  }

  getController() {
    return this.dataHub.getController();
  }

  isLoading(names) {
    return this.isStatus(names, 'isLoading');
  }

  isLocked(names) {
    return this.isStatus(names, 'isLocked');
  }

  initWatch() {
    var off1 = this.emitter.on('$$data', _Timer.default.refreshView);
    var off2 = this.emitter.on('$$status', _Timer.default.refreshView);
    this.emitter.once("$$destroy:".concat(this.logName), () => {
      off1();
      off2();
    });
  }

  initPublicMethods() {
    this.publicMethods(_DataStore.default.publicMethods, 'dataHub', this.controllerPublicMethods);
    this.publicMethods(_RelationManager.default.publicMethods, 'dataHub', this.controllerPublicMethods);
    this.publicMethods(_FetchManager.default.publicMethods, 'fetchManager', this.controllerPublicMethods);
    this.publicMethods(_RunnerManager.default.publicMethods, 'runnerManager', this.controllerPublicMethods);
    this.publicMethods(_ListenerManager.default.publicMethods, 'listenerManager', this.controllerPublicMethods);
    this.publicMethods(publicMethods, 'that', this.controllerPublicMethods);

    this.controllerPublicMethods.destroy = () => this.destroy();
  }

  fetch() {
    return this.fetchManager.fetch(...arguments);
  }

  createController() {
    return new Controller(this.dataHub, this.union.clone()).getPublicMethods();
  }

  getPublicMethods() {
    return _objectSpread({
      key: this.key
    }, this.controllerPublicMethods);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "getDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getController"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLocked", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLocked"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createController"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getPublicMethods", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPublicMethods"), _class.prototype)), _class);
exports.default = Controller;
Controller.publicMethods = publicMethods.concat(_DataStore.default.publicMethods).concat(_RelationManager.default.publicMethods).concat(_RunnerManager.default.publicMethods).concat(_ListenerManager.default.publicMethods).concat(_FetchManager.default.publicMethods);