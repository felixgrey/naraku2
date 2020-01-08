import {
  udFun,
  isNvl
} from '../Utils';

udFun.emit = udFun;

let refreshRate = 20;

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
  constructor(...args) {
    const param = Object.assign({}, ...args);

    let {
      devMode,
      devLog = udFun,
      errLog = udFun,
      emitter = udFun,
    } = param;

    if (isNvl(devMode)) {
      devMode = defaultDevMode;
    }

    this.devLog = devLog;
    this.errLog = errLog;

    this.emitter = emitter;
    this.devMode = devMode;
  }

  clone(...args) {
    return new Union(this, ...args);
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

    instance.errLog = this.errLog.createLog(logName);
    instance.emitter = this.emitter;
    instance.devMode = this.devMode;
    instance.union = this;
  }
}

Union.setRefreshRate = setRefreshRate;
Union.getRefreshRate = getRefreshRate;
Union.setDevMode = setDevMode;
Union.getDevMode = getDevMode;
