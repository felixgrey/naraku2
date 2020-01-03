"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['hasRunner', 'unRegister', 'register', 'run'];
var {
  publicMethod
} = _Component.default;
var RunnerManager = (_class = class RunnerManager extends _Component.default {
  afterCreate() {
    this._runner = {};
  }

  beforeDestroy() {
    Object.keys(this._runner).forEach(name => {
      delete this._dh._runner[name];
    });
    this._runner = null;
  }

  hasRunner(name) {
    if ((0, _Utils.isNvl)(name)) {
      return false;
    }

    return !!this._dh._runner[name];
  }

  unRegister(name) {
    if ((0, _Utils.isNvl)(name)) {
      return;
    }

    if (!this._runner) {
      return;
    }

    delete this._runner[name];
    delete this._dh._runner[name];
  }

  register(name, callback) {
    if ((0, _Utils.isNvl)(name)) {
      return;
    }

    if (this._dh._runner[name]) {
      this.errLog("runner ".concat(name, " has existed."));
      return;
    }

    this._runner[name] = true;
    this._dh._runner[name] = callback;
  }

  run(name) {
    if ((0, _Utils.isNvl)(name)) {
      return _Utils.udFun;
    }

    if (!this._runner[name]) {
      this.errLog("runner ".concat(name, " not existed."));
      return _Utils.udFun;
    }

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    this._emitter.emit('$$run', {
      controller: this._dhc._key,
      name,
      args
    });

    this._emitter.emit("$$run:".concat(name), {
      controller: this._dhc._key,
      args
    });

    return this._dh._runner[name](...args);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "hasRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unRegister", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unRegister"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "register", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "register"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype)), _class);
exports.default = RunnerManager;
RunnerManager.publicMethods = publicMethods;