"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _Utils = require("./../Utils");

var _Union = require("../Common/Union");

var _LifeCycle = _interopRequireDefault(require("./LifeCycle"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var Emitter = (_class = class Emitter extends _LifeCycle.default {
  initialization() {
    this.core = new _events.EventEmitter();
    this.core.setMaxListeners(Infinity);
    this.emitter = this;
    this.union.emitter = this;
    this.updateLogger();
  }

  destruction() {
    this.union.emitter = _Utils.udFun;
  }

  onAndOnce(name, callback, once) {
    if ((0, _Utils.isNvl)(name)) {
      return _Utils.udFun;
    }

    var off = () => {
      if (off.hasOff || this.destroyed) {
        return;
      }

      off.hasOff = true;
      this.devLog("removeListener '".concat(name, "'"));
      this.core.removeListener(name, callback);
    };

    this.core[once ? 'once' : 'on'](name, callback);
    return off;
  }

  on(name, callback) {
    return this.onAndOnce(name, callback, false);
  }

  once(name, callback) {
    return this.onAndOnce(name, callback, true);
  }

  emit(name) {
    if ((0, _Utils.isNvl)(name)) {
      return;
    }

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    this.core.emit(name, ...args);
  }

  clear() {
    this.core.removeAllListeners();
  }

  destroy() {
    super.destroy();
    this.core && this.core.removeAllListeners();
    this.core = null;
  }

}, (_applyDecoratedDescriptor(_class.prototype, "on", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "on"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "once", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "once"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "emit", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "emit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "clear", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "clear"), _class.prototype)), _class);
exports.default = Emitter;