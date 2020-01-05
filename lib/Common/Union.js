"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRefreshRate = setRefreshRate;
exports.getRefreshRate = getRefreshRate;
exports.default = void 0;

var _Utils = require("../Utils");

_Utils.udFun.emit = _Utils.udFun;
var refreshRate = 40;

function setRefreshRate(v) {
  refreshRate = v;
}

function getRefreshRate(v) {
  return refreshRate;
}

class Union {
  constructor() {
    var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var {
      devMode = false,
      devLog = _Utils.udFun,
      errLog = _Utils.udFun,
      emitter = _Utils.udFun
    } = param;
    this.devLog = devLog;
    this.errLog = errLog;
    this.emitter = emitter;
    this.devMode = devMode;
  }

  bindUnion(instance, logName) {
    if (this.devMode) {
      instance.devLog = this.devLog.createLog(logName);
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