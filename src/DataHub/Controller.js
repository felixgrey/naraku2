import {
  udFun,
  isNvl,
} from './../Utils';

import DataStore from './DataStore.js';
import FetchManager from './FetchManager.js';
import RunnerManager from './RunnerManager.js';
import ListenerManager from './ListenerManager.js';
import RelationManager from './RelationManager.js';

import Container from './Container';
import Component from './Component';

import {
	getRefreshRate
} from '../Common/Union';

const publicMethods = [
  'createController',
  'watch',
  'isLoading',
  'isLocked',
  'isWillRefresh',
  'getDataHub',
  'getController',
];

const {
  publicMethod
} = Container;

export default class Controller extends Container {

  initialization(...args) {
		super.initialization(...args);
		
		const [dataHub] = args;
		
    this.dataHubController = this;
		this.dataHub = dataHub;

    this.fetchManager = new FetchManager(this, this.union);
    this.runnerManager = new RunnerManager(this, this.union);
    this.listenerManager = new ListenerManager(this, this.union);

    this.controllerPublicMethods = {};
    this.watchSet = new Set();
    this.refreshTime = 0;
    this.willRefresh = false;
		
		this.containerDestroyOff = Component.prototype.bindContainer.bind(this)(dataHub);

    this.initPublicMethods();
    this.initWatch();
  }
	
	bindContainer(instance) {
		super.bindContainer(instance);
		
		instance.dataHub = this.dataHub;
		instance.dataHubController = this;
	}

  destruction() {
		super.destruction();
		
    clearTimeout(this.refreshTimeoutIndex);

    this.fetchManager.destroy();
    this.fetchManager = null;

    this.runnerManager.destroy();
    this.runnerManager = null;

    this.listenerManager.destroy();
    this.fetchManager = null;
		
		this.containerDestroyOff();
		this.containerDestroyOff = null;

    this.watchSet = null;
    this.controllerPublicMethods = null;

    this.willRefresh = false;
  }

  isStatus(names, type = 'isLoading') {
    if (isNvl(names)) {
      return false;
    }

    for (let name of names) {
      if (this.dataHub.getDataStore(name)[type]) {
        return true;
      }
    }

    return false;
  }

  @publicMethod
  getDataHub() {
    return this.dataHub;
  }

  @publicMethod
  getController() {
    return this.dataHub.getController();
  }

  @publicMethod
  isLoading(names) {
    return this.isStatus(names, 'isLoading');
  }

  @publicMethod
  isLocked(names) {
    return this.isStatus(names, 'isLocked');
  }

  @publicMethod
  isWillRefresh() {
    return this.willRefresh;
  }

  refresh() {
    if (this.destroyed) {
      return;
    }
    this.willRefresh = false;

    this.refreshTime = Date.now();
    for (let callback of this.watchSet) {
      callback();
    }
  }

  initWatch() {
    const lagRefresh = () => {
      if (this.destroyed) {
        return;
      }
      clearTimeout(this.refreshTimeoutIndex);
      this.willRefresh = true;
			
			const refreshRate = getRefreshRate();

      const time = Date.now() - this.refreshTime;
      if (time > refreshRate * 2) {
        this.devLog('refresh now', time);
        this.refresh();
        return;
      }

      this.refreshTimeoutIndex = setTimeout(() => {
        this.devLog('refresh lag', time);
        this.refresh();
      }, refreshRate);
    };

    const off1 = this.emitter.on('$$data', lagRefresh);
    const off2 = this.emitter.on('$$status', lagRefresh);

    this.emitter.once(`$$destroy:Controller:${this.key}`, () => {
      off1();
      off2();
    });

  }

  initPublicMethods() {
    this.publicMethods(DataStore.publicMethods, 'dataHub', this.controllerPublicMethods);
    this.publicMethods(RelationManager.publicMethods, 'dataHub', this.controllerPublicMethods);
    this.publicMethods(FetchManager.publicMethods, 'fetchManager', this.controllerPublicMethods);
    this.publicMethods(RunnerManager.publicMethods, 'runnerManager', this.controllerPublicMethods);
    this.publicMethods(ListenerManager.publicMethods, 'listenerManager', this.controllerPublicMethods);
    this.publicMethods(publicMethods, 'that', this.controllerPublicMethods);
		this.controllerPublicMethods.destroy = () => this.destroy();
  }

  @publicMethod
  watch(callback = udFun) {
    const off = () => {
      if (this.destroyed) {
        return;
      }

      if (!this.watchSet.has(callback)) {
        return;
      }
      this.watchSet.delete(callback);
    };

    this.watchSet.add(callback);
    callback();

    return off;
  }

  @publicMethod
  fetch(...args) {
    return this.fetchManager.fetch(...args);
  }

  @publicMethod
  createController() {
    return new Controller(this.dataHub, this.union.clone()).getPublicMethods();
  }

  @publicMethod
  getPublicMethods() {
    return {
			key: this.key,
      ...this.controllerPublicMethods
    };
  }

}

Controller.publicMethods = publicMethods
  .concat(DataStore.publicMethods)
  .concat(RelationManager.publicMethods)
  .concat(RunnerManager.publicMethods)
  .concat(ListenerManager.publicMethods)
  .concat(FetchManager.publicMethods);
