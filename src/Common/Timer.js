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
  }

  destruction() {
    clearTimeout(this.lagEmitTimeoutIndex);
    this.emitSet = null;
    this.callBackSet = null;
  }

  emitAll = () => {
    clearTimeout(this.lagEmitTimeoutIndex);
    if (this.destroyed) {
      return;
    }

    this.lastEmitTime = Date.now();
    Array.from(this.emitSet).forEach(name => this.emit(name));
    this.emitSet.clear();
    
    Array.from(this.callBackSet).forEach(callback => callback());
    this.callBackSet.clear();
  }

  @publicMethod
  emit(name) {
    this.emitter.emit(name, {
      name: '$$lagEmit'
    });
  }

  @publicMethod
  lagEmit(name, callback = udFun) {
    clearTimeout(this.lagEmitTimeoutIndex);

    const now =  Date.now();

    if (!this.emitSet.size) {
      this.lastEmitTime = now;
    }

    this.emitSet.add(name);
    this.callBackSet.add(udFun);

    if (this.lastEmitTime - now > 2 * getRefreshRate()) {
      this.emitAll();
      return;
    }

    this.lagEmitTimeoutIndex = setTimeout(this.emitAll, getRefreshRate());
  }

  @publicMethod
  onEmit(name, callback = udFun, lifeCycle){
    const off = this.emitter.on(name, callback);

    if (lifeCycle instanceof LifeCycle) {
      lifeCycle.emitter.once('$$destroy', off);
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

Timer.refreshView = () => {
  globalTimer.lagEmit('$$refreshView');
}
Timer.onRefreshView = (callback = udFun, lifeCycle) => {
  return globalTimer.onEmit('$$refreshView', callback, lifeCycle);
}

Timer.refreshViewModel = () => {
  globalTimer.lagEmit('$$refreshViewModel');
}
Timer.onRefreshViewModel = (callback = udFun, lifeCycle) => {
  return globalTimer.onEmit('$$refreshViewModel', callback, lifeCycle);
}
