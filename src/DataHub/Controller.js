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
  'isLocked',
  'hasError',
  'getDataHub',
  'getController',
  'isWillUpdateView'
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

    this.containerDestroyOff = Component.prototype.bindContainer.bind(this)(dataHub);

    this.initPublicMethods();

    this.watchModelOff = this.emitter.on('$$model', () => {
      this.willUpdateView = true;
      Timer.refreshView();
    });

    Timer.onRefreshView(() => {
      if (this.destroyed) {
        return;
      }

      this.willUpdateView = false;
    }, this);
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

    this.watchModelOff();
    this.watchModelOff = null;

    this.controllerPublicMethods = null;
  }


  isStatus(names, type = 'isLoading') {
    for (let name of names) {
      if (isNvl(name)) {
        continue;
      }

      if (this.dataHub.getDataStore(name)[type]()) {
        return true;
      }
    }

    return false;
  }

  @publicMethod
  isWillUpdateView() {
    return this.willUpdateView;
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
  isLoading(...names) {
    return this.isStatus(names, 'isLoading');
  }

  @publicMethod
  isLocked(...names) {
    return this.isStatus(names, 'isLocked');
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
    this.controllerPublicMethods.destroy = () => this.destroy();
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
