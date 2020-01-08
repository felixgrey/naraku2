"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Union = _interopRequireDefault(require("../Common/Union"));

var _Emitter = _interopRequireDefault(require("../Common/Emitter.js"));

var _LifeCycle = _interopRequireDefault(require("../Common/LifeCycle"));

var _ErrorType = _interopRequireDefault(require("../Common/ErrorType"));

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var {
  getRefreshRate
} = _Union.default;
var Timer = (_class = (_temp = class Timer extends _LifeCycle.default {
  constructor() {
    super(...arguments);

    this.emitAll = () => {
      clearTimeout(this.lagEmitTimeoutIndex);

      if (this.destroyed) {
        return;
      }

      this.lastEmitTime = Date.now();
      Array.from(this.emitSet).forEach(name => this.emit(name));
      this.emitSet.clear();
      Array.from(this.callBackSet).forEach(callback => callback());
      this.callBackSet.clear();
    };
  }

  initialization() {
    this.emitSet = new Set();
    this.callBackSet = new Set();
  }

  destruction() {
    clearTimeout(this.lagEmitTimeoutIndex);
    this.emitSet = null;
    this.callBackSet = null;
  }

  emit(name) {
    this.emitter.emit(name, {
      name: '$$lagEmit'
    });
  }

  lagEmit(name) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
    clearTimeout(this.lagEmitTimeoutIndex);
    var now = Date.now();

    if (!this.emitSet.size) {
      this.lastEmitTime = now;
    }

    this.emitSet.add(name);
    this.callBackSet.add(_Utils.udFun);

    if (this.lastEmitTime - now > 2 * getRefreshRate()) {
      this.emitAll();
      return;
    }

    this.lagEmitTimeoutIndex = setTimeout(this.emitAll, getRefreshRate());
  }

  onEmit(name) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
    var lifeCycle = arguments.length > 2 ? arguments[2] : undefined;
    var off = this.emitter.on(name, callback);

    if (lifeCycle instanceof _LifeCycle.default) {
      lifeCycle.emitter.once('$$destroy', off);
    }

    return off;
  }

}, _temp), (_applyDecoratedDescriptor(_class.prototype, "emit", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "emit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "lagEmit", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "lagEmit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "onEmit", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "onEmit"), _class.prototype)), _class);
exports.default = Timer;
var union = new _Union.default({
  devLog: (0, _Utils.createLog)('global.Timer', 'log'),
  errLog: (0, _Utils.createLog)('global.Timer', 'error')
});
new _Emitter.default(union);
var globalTimer = new Timer(union);
globalTimer.destroy = _Utils.udFun;
Timer.globalTimer = globalTimer;

Timer.lagEmit = function () {
  return globalTimer.lagEmit(...arguments);
};

Timer.onEmit = function () {
  return globalTimer.onEmit(...arguments);
};

Timer.refreshView = () => {
  globalTimer.lagEmit('$$refreshView');
};

Timer.onRefreshView = function () {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
  var lifeCycle = arguments.length > 1 ? arguments[1] : undefined;
  return globalTimer.onEmit('$$refreshView', callback, lifeCycle);
};

Timer.refreshViewModel = () => {
  globalTimer.lagEmit('$$refreshViewModel');
};

Timer.onRefreshViewModel = function () {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
  var lifeCycle = arguments.length > 1 ? arguments[1] : undefined;
  return globalTimer.onEmit('$$refreshViewModel', callback, lifeCycle);
};