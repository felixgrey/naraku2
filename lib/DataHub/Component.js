"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("../Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

var _LifeCycle = _interopRequireDefault(require("../Common/LifeCycle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Component extends _LifeCycle.default {
  _initialization(container) {
    if (typeof container !== 'object') {
      container = {
        _key: '???',
        _clazz: '???'
      };
    }

    this._dhc = container._dhc || null;
    this._dh = container._dh || null;
    this._store = container._store || null;
    this._emitter = container._emitter || _Utils.udFun;
    this.devLog = container.devLog || _Utils.udFun;
    this.errLog = container.errLog || _Utils.udFun;

    this._emitter.once("$$destroy:".concat(container._clazz, "=").concat(container._key), () => {
      this.devLog("".concat(container._clazz, "=").concat(container._key, " destroyed => ").concat(this._logName, " destroyed ."));
      this.destroy();
    });

    if (_Utils.createLog.showPublicMethods) {
      this.devLog("publicMethods of ".concat(this._clazz), this.constructor.prototype._publicMethods);
    }
  }

  _destruction() {
    this._dh = null;
    this._dhc = null;
    this._store = null;
  }

}

exports.default = Component;
Component.publicMethod = _LifeCycle.default.publicMethod;