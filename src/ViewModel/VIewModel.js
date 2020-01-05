import {
  createLog,
  isBlank,
  isNvl,
  udFun,
  sameFun,
  toCamel,
  toUnderline,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';
import DataHub from './../DataHub/DataHub';
import Controller from './../DataHub/Controller';
import ViewContext from './ViewContext';

const {
  publicMethod
} = LifeCycle;

export default class ViewModel extends LifeCycle {

  _initialization(viewProps = {}, dhConfig = null, viewContext = null) {
    this._viewProps = viewProps;
    this._viewStatus = {};
    this._changeHandle = udFun;

    this._viewType = isNvl(viewProps.viewType) ? 'View' : viewProps.viewType;
    this._viewMethods = isNvl(viewProps.viewMethods) ? {} : viewProps.viewMethods;

    this._parentKey = isNvl(viewProps.parentKey) ? null : viewProps.parentKey;
    this._name = isNvl(viewProps.myName) ? null : viewProps.myName;
    this._withStore = isNvl(viewProps.withStore) ? null : viewProps.withStore;

    this._gdhc = DataHub.createController();
    this._gdhc.watch(() => {
      this._changeHandle();
    });

    Controller.publicMethods.forEach(method => {
      this[method] = udFun;
    });

    if (!viewContext instanceof ViewContext) {
      this.errLog(`${this._logName} not has ViewContext.`);
    } else {
      viewContext.createNode(this._key, this._viewType, this);
      this._viewContext = viewContext;

      this._cc = viewContext.getController().createController();
      this.publicMethods(Controller.publicMethods, '_cc');
      this._cc.watch(() => {
        if (DataHub.isWillRefresh()) {
          return;
        }
        this._changeHandle();
      });

      if (!isNvl(this._name)) {
        for (let method in this._viewMethods) {
          this._cc.register(method, this._viewMethods[method]);
        }
      }
    }

    if (viewContext && isNvl(dhConfig)) {
      this._dh = viewContext.getDataHub();
    } else {
      this._dh = new DataHub(dhConfig, this.devLog, this.errLog, this._devMode)
    }
  }

  @publicMethod
  getParent() {
    if (!this._viewContext) {
      // this.devLog('getParent: no viewContext');
      return null;
    }

    const parentNode = this._viewContext.getParent(this._viewKey);
    if (!parentNode) {
      return null;
    }

    return parentNode.payload;
  }

  @publicMethod
  getParentChain() {
    // this.devLog('getParentChain', this._viewKey);
    if (!this._viewContext) {
      // this.devLog('getParentChain: no viewContext');
      return [];
    }
    return this._viewContext.getParentChain(this._viewKey).map(node => node.payload);
  }

  @publicMethod
  getMyDataHub() {
    return this._dh;
  }

  @publicMethod
  setViewStatus(value) {
    Object.assign(this._viewStatus, value);
    this._cc.emit('$$data', {
      name: '$$viewStatus',
      value
    });
  }

  @publicMethod
  getViewStatus() {
    return {
      ...this._viewStatus
    };
  }

  @publicMethod
  run(...args) {
    if (!this._viewContext) {
      this.methodErrLog('run', args, 'noViewContext');
      return;
    }

    return this._cc.run(...args);
  }

  @publicMethod
  destroyHandle() {
    if (this._destroyed) {
      return;
    }

    this._viewContext && this._viewContext.removeNode(this._key);
    this.destroy();
  }

  onChange(callback = udFun) {
    if (this._destroyed) {
      return;
    }

    this._changeHandle = callback;
  }

  _destruction() {
    this._dh && this._dh.destroy();
    this._dh = null;

    this._gdhc.destroy();
    this._gdhc = null;

    this._viewContext && this._viewContext.removeNode(this._key);
    this._viewContext = null;

    this._viewStatus = null;

    this._cc && this._cc.destroy();
    this._cc = null;
  }

}

ViewModel.$loggerByParam = true;
