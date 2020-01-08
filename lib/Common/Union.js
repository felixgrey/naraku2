"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRefreshRate = setRefreshRate;
exports.getRefreshRate = getRefreshRate;
exports.setDevMode = setDevMode;
exports.getDevMode = getDevMode;
exports.default = void 0;

var _Utils = require("../Utils");

_Utils.udFun.emit = _Utils.udFun;
var refreshRate = 20;

function setRefreshRate(v) {
  refreshRate = v;
}

function getRefreshRate(v) {
  return refreshRate;
}

var defaultDevMode = false;

function setDevMode(flag) {
  defaultDevMode = flag;
}

function getDevMode(flag) {
  return defaultDevMode;
}

class Union {
  constructor() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var param = Object.assign({}, ...args);
    var {
      devMode,
      devLog = _Utils.udFun,
      errLog = _Utils.udFun,
      emitter = _Utils.udFun
    } = param;

    if ((0, _Utils.isNvl)(devMode)) {
      devMode = defaultDevMode;
    }

    this.devLog = devLog;
    this.errLog = errLog;
    this.emitter = emitter;
    this.devMode = devMode;
  }

  clone() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return new Union(this, ...args);
  }

  bindUnion(instance) {
    var logName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (this.devMode) {
      if (!(0, _Utils.isNvl)(logName)) {
        instance.devLog = this.devLog.createLog(logName);
      } else {
        instance.devLog = this.devLog;
      }
    } else {
      instance.devLog = _Utils.udFun;
    }

    instance.errLog = this.errLog.createLog(logName);
    instance.emitter = this.emitter;
    instance.devMode = this.devMode;
    instance.union = this;
  }

}

exports.default = Union;
Union.setRefreshRate = setRefreshRate;
Union.getRefreshRate = getRefreshRate;
Union.setDevMode = setDevMode;
Union.getDevMode = getDevMode;