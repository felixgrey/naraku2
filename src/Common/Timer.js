import {
  udFun,
  createLog
} from './../Utils';

import Union from '../Common/Union';
import Emitter from '../Common/Emitter.js';
import LifeCycle from '../Common/LifeCycle';
import ErrorType from '../Common/ErrorType';

const {
  publicMethod
} = LifeCycle;

const {
  getRefreshRate
} = Union;

export default class Timer extends LifeCycle {
  initialization() {
    this.emitSet = new Set();
    this.callBackSet = new Set();
    this.valueSet = new Set();
  }

  destruction() {
    clearTimeout(this.lagEmitTimeoutIndex);
    this.emitSet = null;
    this.callBackSet = null;
    this.valueSet = null;
  }

  emitAll = () => {
    if (this.destroyed) {
      return;
    }

    const emitSet = this.emitSet;
    const callBackSet = this.callBackSet;
    const values = [...this.valueSet];

    this.emitSet = new Set();
    this.callBackSet = new Set();
    this.valueSet = new Set();

    this.lastEmitTime = Date.now();

    Array.from(emitSet).forEach(name => this.emit(name, values));
    Array.from(callBackSet).forEach(callback => callback(values));
  }

  @publicMethod
  emit(name, values) {
    this.emitter.emit(name, {
      name: '$$lagEmit',
      values
    });
  }

  @publicMethod
  lagEmit(name, value, callback = udFun) {
    clearTimeout(this.lagEmitTimeoutIndex);

    const now = Date.now();

    if (!this.emitSet.size) {
      this.lastEmitTime = now;
    }

    this.emitSet.add(name);
    this.callBackSet.add(callback);
    this.valueSet.add(value);

    if (this.lastEmitTime - now > 2 * getRefreshRate()) {
      clearTimeout(this.lagEmitTimeoutIndex);
      this.emitAll();
      return;
    }

    this.lagEmitTimeoutIndex = setTimeout(this.emitAll, getRefreshRate());
  }

  @publicMethod
  clearEmit() {
    clearTimeout(this.lagEmitTimeoutIndex);
  }

  @publicMethod
  onEmit(name, callback = udFun, lifeCycle) {
    const off = this.emitter.on(name, callback);

    if (lifeCycle instanceof LifeCycle) {
      lifeCycle.emitter.once(`$$destroy:${lifeCycle.logName}`, off);
    }

    return off;
  }

}

const union = new Union({
  devLog: createLog('global.Timer', 'log'),
  errLog: createLog('global.Timer', 'error'),
});
new Emitter(union);

const globalTimer = new Timer(union);
globalTimer.destroy = udFun;

Timer.globalTimer = globalTimer;
Timer.lagEmit = (...args) => globalTimer.lagEmit(...args);
Timer.onEmit = (...args) => globalTimer.onEmit(...args);
Timer.clearEmit = () => globalTimer.clearEmit();

Timer.refreshView = (dsKey) => {
  setTimeout(() => {
    if (globalTimer.destroyed) {
      return;
    }
    globalTimer.lagEmit('$$refreshView', dsKey);
  });
}
Timer.onRefreshView = (callback = udFun, lifeCycle) => {
  return globalTimer.onEmit('$$refreshView', callback, lifeCycle);
}

Timer.refreshViewModel = (dsKey) => {
  globalTimer.lagEmit('$$refreshViewModel', dsKey);
}
Timer.onRefreshViewModel = (callback = udFun, lifeCycle) => {
  return globalTimer.onEmit('$$refreshViewModel', callback, lifeCycle);
}
