import {
  udFun,
  isNvl,
} from './../Utils';

import DataStore from './DataStore.js';
import FetchManager from './FetchManager.js';
import RunnerManager from './RunnerManager.js';
import ListenerManager from './ListenerManager.js';
import RelationManager from './RelationManager.js';
import LifeCycle from '../Common/LifeCycle';

const publicMethods = [
  'createController',
  'watch',
  'isLoading',
  'isLocked',
  'isWillRefresh',
  'getDataHub',
  'getController',
  'destroy',
];

publicMethods.forEach(method => {
  udFun[method] = udFun;
});

let refreshRate = 40;

const {
  publicMethod
} = LifeCycle;

export function setRefreshRate(v) {
  refreshRate = v;
}

export default class Controller extends LifeCycle {

  afterCreate(dh) {
    this._dhc = this;

    this._fetchManager = new FetchManager(this, refreshRate, this._devMode);
    this._runnerManager = new RunnerManager(this, this._devMode);
    this._listenerManager = new ListenerManager(this, this._devMode);

    this._publicMethods = {};
    this._watchSet = new Set();
    this._refreshTime = 0;
    this._willRefresh = false;

    this._initPublicMethods();
    this._initWatch();
  }

  beforeDestroy() {
    clearTimeout(this.refreshTimeoutIndex);

    this._fetchManager.destroy();
    this._fetchManager = null;

    this._runnerManager.destroy();
    this._runnerManager = null;

    this._listenerManager.destroy();
    this._fetchManager = null;

    this._watchSet = null;
    this._publicMethods = null;

    this._willRefresh = false;
  }

  _isStatus(names, type = 'isLoading') {
    if (isNvl(names)) {
      return false;
    }

    for (let _name of names) {
      if (this._dh.getDataStore(_name)[type]) {
        return true;
      }
    }

    return false;
  }

  @publicMethod
  getDataHub() {
    return this._dh;
  }

  @publicMethod
  getController() {
    return this._dh.getController();
  }

  @publicMethod
  isLoading(names) {
    return this._isStatus(names, 'isLoading');
  }

  @publicMethod
  isLocked(names) {
    return this._isStatus(names, 'isLocked');
  }

  @publicMethod
  isWillRefresh() {
    return this._willRefresh;
  }

  _refresh() {
    if (this._destroyed) {
      return;
    }
    this._willRefresh = false;

    this._refreshTime = Date.now();
    for (let callback of this._watchSet) {
      callback();
    }
  }

  _initWatch() {
    const lagRefresh = () => {
      if (this._destroyed) {
        return;
      }
      clearTimeout(this.refreshTimeoutIndex);
      this._willRefresh = true;

      const time = Date.now() - this._refreshTime;
      if (time > refreshRate * 2) {
        this.devLog('refresh now', time);
        this._refresh();
        return;
      }

      this.refreshTimeoutIndex = setTimeout(() => {
        this.devLog('refresh lag', time);
        this._refresh();
      }, refreshRate);
    };

    const off1 = this._emitter.on('$$data', lagRefresh);
    const off2 = this._emitter.on('$$status', lagRefresh);

    this._emitter.once(`$$destroy:Controller:${this._key}`, () => {
      off1();
      off2();
    });

  }

  _initPublicMethods() {
    this.publicMethods(DataStore.publicMethods, '_dh', this._publicMethods);
    this.publicMethods(RelationManager.publicMethods, '_dh', this._publicMethods);
    this.publicMethods(FetchManager.publicMethods, '_fetchManager', this._publicMethods);
    this.publicMethods(RunnerManager.publicMethods, '_runnerManager', this._publicMethods);
    this.publicMethods(ListenerManager.publicMethods, '_listenerManager', this._publicMethods);
    this.publicMethods(publicMethods, '_that', this._publicMethods);
  }

  @publicMethod
  watch(callback = udFun) {
    const off = () => {
      if (this._destroyed) {
        return;
      }

      if (!this._watchSet.has(callback)) {
        return;
      }
      this._watchSet.delete(callback);
    };

    this._watchSet.add(callback);
    callback();

    return off;
  }

  @publicMethod
  fetch(...args) {
    return this._fetchManager.fetch(...args);
  }

  @publicMethod
  createController() {
    return new Controller(this._dh, this._devMode).getPublicMethods();
  }

  @publicMethod
  getPublicMethods() {
    return {
      ...this._publicMethods
    };
  }

}

Controller.publicMethods = publicMethods
  .concat(DataStore.publicMethods)
  .concat(RelationManager.publicMethods)
  .concat(RunnerManager.publicMethods)
  .concat(ListenerManager.publicMethods)
  .concat(FetchManager.publicMethods);
