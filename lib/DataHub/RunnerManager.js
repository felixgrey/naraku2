"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _ErrorType = _interopRequireDefault(require("../Common/ErrorType"));

var _Component = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['hasRunner', 'unRegister', 'register', 'run'];
var {
  publicMethod
} = _Component.default;
var RunnerManager = (_class = class RunnerManager extends _Component.default {
  initialization() {
    super.initialization(...arguments);
    this.registerRunner = {};
  }

  destruction() {
    super.destruction();
    Object.keys(this.registerRunner).forEach(name => {
      this.dataHub.unRegister(name);
    });
    this.registerRunner = null;
  }

  hasRunner(name) {
    if ((0, _Utils.isNvl)(name)) {
      return false;
    }

    return this.dataHub.hasRunner(name);
  }

  unRegister(name) {
    if ((0, _Utils.isNvl)(name)) {
      return false;
    }

    if (!this.registerRunner[name]) {
      return false;
    }

    delete this.registerRunner[name];
    this.dataHub.removeRunner(name);
    return true;
  }

  register(name, callback) {
    if ((0, _Utils.isNvl)(name)) {
      return false;
    }

    if (this.hasRunner(name)) {
      this.methodErrLog('register', [name], _ErrorType.default.duplicateDeclare);
      return false;
    }

    this.registerRunner[name] = true;
    this.dataHub.addRunner(name, callback);
    return true;
  }

  run(name) {
    if ((0, _Utils.isNvl)(name)) {
      return _Utils.udFun;
    }

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!this.registerRunner[name]) {
      this.methodErrLog('run', [name, ...args], _ErrorType.default.notExist);
      return _Utils.udFun;
    }

    this.emitter.emit('$$run', {
      controller: this.dataHubController.key,
      name,
      args
    });
    this.emitter.emit("$$run:".concat(name), {
      controller: this.dataHubController.key,
      args
    });
    return this.dataHub.run(name, ...args);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "hasRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unRegister", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unRegister"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "register", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "register"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype)), _class);
exports.default = RunnerManager;
RunnerManager.publicMethods = publicMethods;