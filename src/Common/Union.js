import {
  udFun,
  isNvl
} from '../Utils';

udFun.emit = udFun;

let refreshRate = 16;

export function setRefreshRate(v) {
  refreshRate = v;
}

export function getRefreshRate(v) {
  return refreshRate;
}

let defaultDevMode = false;

export function setDevMode(flag) {
  defaultDevMode = flag
}

export function getDevMode(flag) {
  return defaultDevMode;
}

export default class Union {
  constructor(origin, param) {
    if (isNvl(param)) {
      param = origin;
      origin = {};
    }

    const paramData = Object.assign({}, origin, param);

    let {
      devMode,
      devLog = udFun,
      errLog = udFun,
      emitter = udFun,
    } = paramData;

    if (isNvl(devMode)) {
      devMode = defaultDevMode;
    }

    this.devLog = devLog;
    this.errLog = errLog;

    this.emitter = emitter;
    this.devMode = devMode;
  }

  clone(param) {
    return new Union(this, param);
  }

  bindUnion(instance, logName = null) {
    if (this.devMode) {
      if (!isNvl(logName)) {
        instance.devLog = this.devLog.createLog(logName);
      } else {
        instance.devLog = this.devLog;
      }
    } else {
      instance.devLog = udFun;
    }

    if (!isNvl(logName)) {
      instance.errLog = this.errLog.createLog(logName);
    } else {
      instance.errLog = this.errLog;
    }

    instance.emitter = this.emitter;
    instance.devMode = this.devMode;
    instance.union = this;
  }
}

Union.setRefreshRate = setRefreshRate;
Union.getRefreshRate = getRefreshRate;
Union.setDevMode = setDevMode;
Union.getDevMode = getDevMode;
