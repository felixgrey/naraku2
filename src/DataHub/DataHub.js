import {
  udFun,
  createLog,
  isNvl,
  snapshot,
} from './../Utils';

import Union from '../Common/Union.js';
import Emitter from '../Common/Emitter.js';
import Container from './Container';
import DataStore from './DataStore';

import Controller from './Controller';
import RelationManager from './RelationManager';

const {
  publicMethod
} = Container;

const publicMethods = [
  'getExportParam'
];

export default class DataHub extends Container {

  initialization(...args) {
    super.initialization(...args);

    const [cfg] = args;

    this.cfg = cfg || {};
    this.dataHub = this;
    this.newEmitter = false;

    if (!(this.emitter instanceof Emitter)) {
      // this.devLog('new Emitter', this.emitter);
      this.emitter = new Emitter(this.union);
      this.newEmitter = true;
    }

    this.dataHubController = new Controller(this, this.union);

    this.dataCenter = {};

    this.initDsPublicMethods();
    this.init();

  }

  bindContainer(instance) {
    super.bindContainer(instance);

    instance.dataHub = this;
  }

  destruction() {
    super.destruction();

    Object.values(this.dataCenter).forEach(ds => ds.destroy());
    this.dataCenter = null;

    this.dataHubController && this.dataHubController.destroy();
    this.dataHubController = null;
  }

  destroy() {
    const emitter = this.emitter;
    super.destroy();
    this.newEmitter && emitter.destroy();
  }

  init() {
    for (let name in this.cfg) {
      if (/\_|\$/g.test(name.charAt(0))) {
        this.setData(name, this.cfg[name]);
        continue;
      }
      this.getDataStore(name).setConfig(this.cfg[name]);
    }
  }

  initDsPublicMethods() {
    this.getValue = (fullPath = '', defaultValue) => {
      if (this.destroyed) {
        this.destroyedErrorLog('getValue');
        return udFun;
      }

      const [storeName, ...pathArr] = fullPath.split('.');
      const path = pathArr.join('.');
      return this.getDataStore(storeName).getValue(path, defaultValue);
    };

    [].concat(RelationManager.publicMethods)
      .concat(DataStore.publicMethods)
      .forEach(methodName => {
        if (methodName === 'getValue') {
          return;
        }

        this[methodName] = (name, ...args) => {
          if (this.destroyed) {
            this.destroyedErrorLog(methodName);
            return udFun;
          }

          return this.getDataStore(name)[methodName](...args);
        }
      });
  }

  turnTo(method, flag) {
    for (let name in this.dataCenter) {
      this.getDataStore(name)[method](flag);
    }
  }


  @publicMethod
  getExportParam(name, pageNumber = -1, pageSize = -1) {
    if (isNvl(name)) {
      return udFun;
    }

    const dataStore = this.getDataStore(name);
    const pageInfo = dataStore.getPageInfo(name);

    const param = snapshot(dataStore.lastFetchParam);

    if (pageInfo.hasPagiNation) {
      const {
        pageNumberField,
        pageSizeField,
      } = pageInfo.pagiNationConfig;

      param[pageNumberField] = pageNumber;
      param[pageSizeField] = pageSize;
    }

    return param;
  }

  @publicMethod
  turnOnAll(flag) {
    this.turnTo('turnOn', flag);
  }

  @publicMethod
  turnOffAll() {
    this.turnTo('turnOff', false);
  }

  @publicMethod
  getDsKey(name) {
    if (isNvl(name) || !this.dataCenter[name]) {
      return 0;
    }

    return this.dataCenter[name].key;
  }

  @publicMethod
  getDataStore(name) {
    this.devLog('getDataStore', name);

    if (isNvl(name)) {
      return udFun;
    }

    if (!this.dataCenter[name]) {
      this.dataCenter[name] = new DataStore(this, name, this.union);
    }

    return this.dataCenter[name];
  }

  @publicMethod
  getController() {
    if (!this.dataHubController) {
      return udFun;
    }

    return this.dataHubController.getPublicMethods();
  }
}

// console.log(Union.getDevMode());

const union = new Union({
  devLog: createLog('global.Datahub', 'log'),
  errLog: createLog('global.Datahub', 'error'),
});

const globalDataHub = new DataHub({}, union);
const globalMethods = globalDataHub.getController();
globalDataHub.isGlobalDataHub = true;

globalDataHub.destroy = udFun;

DataHub.globalDataHub = globalDataHub;
Object.keys(globalMethods).forEach(method => {
  if (method === 'destroy') {
    return;
  }
  DataHub[method] = (...args) => globalMethods[method](...args);
});

DataHub.gdh = {
  ...globalMethods,
  destroy: udFun,
};

DataHub.getGlobalUnion = () => union.clone();

DataHub.create = (cfg = {}) => {

  const logName = isNvl(cfg.$logName) ? 'DataHub' : cfg.$logName;

  const union = new Union({
    devLog: createLog(logName, 'log'),
    errLog: createLog(logName, 'error'),
  });

  return new DataHub({}, union);
}

DataHub.gDhName = 'gdh';
DataHub.cDhName = 'cdh';
DataHub.dhName = 'dh';
DataHub.pDhName = 'pdh';
DataHub.myDhName = 'mdh';
DataHub.runName = 'run';
DataHub.hasRunnerName = 'hasRunner';
DataHub.refresh = 'refresh';
DataHub.watchAll = false;

DataHub.publicMethods = publicMethods;

export {
  DataHub
}
