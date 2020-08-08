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
import Timer from '../Common/Timer';

import {
  getRefreshRate
} from '../Common/Union';

const publicMethods = [
  'createController',
  'isLoading',
  'isReady',
  'getExportParam',
  'isLocked',
  'hasError',
  'getDataHub',
  'getDsKey',
  'getStoreInfo',
  'getController',
  'stopFetchStore',
  'refresh'
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
    this.dhKey = this.dataHub.key;

    this.fetchManager = new FetchManager(this, this.union);
    this.runnerManager = new RunnerManager(this, this.union);
    this.listenerManager = new ListenerManager(this, this.union);

    this.controllerPublicMethods = {};

    this.containerDestroyOff = Component.prototype.bindContainer.bind(this)(dataHub);

    this.initPublicMethods();
  }

  bindContainer(instance) {
    super.bindContainer(instance);

    instance.dataHub = this.dataHub;
    instance.dataHubController = this;
  }

  destruction() {
    super.destruction();

    clearTimeout(this.lagEmitTimeoutIndex);
    clearTimeout(this.refreshTimeoutIndex);

    this.fetchManager.destroy();
    this.fetchManager = null;

    this.runnerManager.destroy();
    this.runnerManager = null;

    this.listenerManager.destroy();
    this.fetchManager = null;

    this.containerDestroyOff();
    this.containerDestroyOff = null;

    this.controllerPublicMethods = null;
  }

  isStatus(names, type = 'isLoading', ...args) {
    for (let name of names) {
      if (isNvl(name)) {
        continue;
      }

      if (this.dataHub.getDataStore(name)[type](...args)) {
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
  getDsKey(name) {
    return this.dataHub.getDsKey(name);
  }

  @publicMethod
  getController() {
    return this.dataHub.getController();
  }

  @publicMethod
  getExportParam(...args) {
    return this.dataHub.getExportParam(...args);
  }

  @publicMethod
  isLoading(...names) {
    let just = true;
    let allReady = true;

    if (typeof names[names.length - 1] === 'boolean') {
      just = names[names.length - 1];
      names.pop();

      if (typeof names[names.length - 1] === 'boolean') {
        allReady = just;
        just = names[names.length - 1];
        names.pop();
      }
    }

    return this.isStatus(names, 'isLoading', just, allReady);
  }

  @publicMethod
  isLocked(...names) {
    return this.isStatus(names, 'isLocked');
  }

  @publicMethod
  isReady(...names) {
    return this.isStatus(names, 'isReady');
  }

  @publicMethod
  hasError(...names) {
    return this.isStatus(names, 'hasError');
  }

  initPublicMethods() {
    this.publicMethods(DataStore.publicMethods, 'dataHub', this.controllerPublicMethods);
    this.publicMethods(RelationManager.publicMethods, 'dataHub', this.controllerPublicMethods);
    this.publicMethods(FetchManager.publicMethods, 'fetchManager', this.controllerPublicMethods);
    this.publicMethods(RunnerManager.publicMethods, 'runnerManager', this.controllerPublicMethods);
    this.publicMethods(ListenerManager.publicMethods, 'listenerManager', this.controllerPublicMethods);
    this.publicMethods(publicMethods, 'that', this.controllerPublicMethods);

    this.controllerPublicMethods.getStoreInfo = () => this.getStoreInfo();
    this.controllerPublicMethods.destroy = () => this.destroy();
  }

  @publicMethod
  refresh(name) {
    if (isNvl(name)) {
      return;
    }

    const relationManager = this.dataHub.getDataStore(name).relationManager;
    if (relationManager) {
      relationManager.refreshStore();
    }
  }

  @publicMethod
  stopFetchStore(name) {
    this.dataHub.dataHubController.fetchManager.stopFetch(name, true);
  }

  @publicMethod
  createController() {
    return new Controller(this.dataHub, this.union.clone()).getPublicMethods();
  }

  @publicMethod
  getStoreInfo() {
    const info = {};
    const dataCenter = this.dataHub.dataCenter;

    for (let name in dataCenter) {
      info[name] = dataCenter[name].getStoreInfo();
    }

    return info;
  }

  @publicMethod
  getPublicMethods() {
    return {
      dhKey: this.dhKey,
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
