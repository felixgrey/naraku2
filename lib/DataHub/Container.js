"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _LifeCycle = _interopRequireDefault(require("../Common/LifeCycle"));

var _ErrorType = _interopRequireDefault(require("../Common/ErrorType"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var Container = (_class = class Container extends _LifeCycle.default {
  initialization() {
    this.updateLogger();
    this.data = {};
    this.runner = {};
  }

  bindUnion(instance, logName) {
    this.union.bindUnion(instance, logName);
    this.bindContainer(instance);
  }

  bindContainer(instance) {
    instance.dataHub = this;
    instance.dataHubController = this;
    instance.dataStore = this;
  }

  destruction() {
    this.runner = null;
    this.data = null;
  }

  removeData(name) {
    if (!this.data.hasOwnProperty(name)) {
      return false;
    }

    delete this.data[name];
    return true;
  }

  hasData(name) {
    return this.data.hasOwnProperty(name);
  }

  getData(name) {
    return this.data[name];
  }

  setData(name, value) {
    this.data[name] = value;
  }

  hasRunner(name) {
    return !!this.runner[name];
  }

  getRunner(name) {
    return this.runner[name];
  }

  addRunner(name, callback) {
    if (this.runner[name]) {
      return false;
    }

    this.runner[name] = callback;
    return true;
  }

  removeRunner(name) {
    if (!this.runner[name]) {
      return false;
    }

    delete this.runner[name];
    return true;
  }

  run(name) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!this.runner[name]) {
      this.methodErrLog('run', [name, ...args], _ErrorType.default.notExist);
      return _Utils.udFun;
    }

    return this.runner[name](...args);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "removeData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "removeData"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "hasData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasData"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getData"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setData"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "hasRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "addRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "addRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "removeRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "removeRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype)), _class);
exports.default = Container;
Container.publicMethod = publicMethod;