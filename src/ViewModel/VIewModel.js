import {
  isNvl,
  udFun,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';
import DataHub from './../DataHub/DataHub';
import Controller from './../DataHub/Controller';
import ErrorType from '../Common/ErrorType';
import ViewContext from './ViewContext';
import Timer from '../Common/Timer';

const {
  publicMethod
} = LifeCycle;

export default class ViewModel extends LifeCycle {

  initialization(viewProps = {}, dhConfig = null, viewContext = null) {
    this.viewProps = viewProps;
    this.changeHandle = udFun;
    this.data = {};
    this.contextController = null;

    const {
      viewType,
      viewMethods,
      myName,
      parentKey,
      withStore,
      useContextDataHub,
      useMyDataHub,
      useParentDataHub,
    } = viewProps;

    // 初始化
    this.viewType = isNvl(viewType) ? 'View' : viewType;
    this.viewMethods = isNvl(viewMethods) ? {} : viewMethods;
    this.parentKey = isNvl(parentKey) ? null : parentKey;
    this.name = isNvl(myName) ? null : myName;
    this.withStore = isNvl(withStore) ? null : withStore;

    this.updateLogger();

    this.globalDataHubController = DataHub.createController();

    Controller.publicMethods.forEach(method => {
      this[method] = udFun;
    });

    if (!(viewContext instanceof ViewContext)) {
      this.hasViewContext = false;
      this.errLog(`${this.logName} not has ViewContext.`);
    } else {
      this.hasViewContext = true;
      viewContext.createNode(this.key, this.viewType, this);
      this.viewContext = viewContext;

      this.contextController = viewContext.getController().createController();
      this.publicMethods(Controller.publicMethods, 'contextController');

      if (!isNvl(this.name)) {
        for (let method in this.viewMethods) {
          this.contextController.register(`${this.name}.${method}`, this.viewMethods[method]);
        }
      }
    }

    // 根视图
    this.isContextViewModel = this.viewContext && isNvl(dhConfig);

    if (this.isContextViewModel) {
      this.dataHub = this.viewContext.getDataHub();
    } else {
      this.dataHub = new DataHub(dhConfig || {}, this.union);
    }

    this.dataHubController = this.dataHub.getController().createController();
    this.defaultController = this.contextController;

    const {
      $useMyDataHub = false,
        $useParentDataHub = false,
        $useContextDataHub = false,
    } = this.dataHub.cfg;

    const parents = this.viewContext.getParentChain(this.key);
    for (let parent of parents) {
      const {
        $childWithMyDataHub = false
      } = parent.payload.dataHub.cfg;

      if ($childWithMyDataHub) {
        this.defaultController = parent.payload.defaultController.createController();
        break;
      }
    }

    if ($useContextDataHub) {
      this.defaultController = this.contextController;
    }

    if ($useParentDataHub && parents.length) {
      this.defaultController = parents[0].payload.defaultController.createController();
    }

    if ($useMyDataHub) {
      this.defaultController = this.dataHubController;
    }

    if (useContextDataHub) {
      this.defaultController = this.contextController;
    }

    if (useParentDataHub && parents.length) {
      this.defaultController = parents[0].payload.defaultController.createController();
    }

    if (useMyDataHub) {
      this.defaultController = this.dataHubController;
    }

    if (this.isContextViewModel || !this.hasViewContext) {
      Timer.onRefreshView(() => {
        if (this.destroyed) {
          return;
        }

        this.changeHandle();
      }, this);
    }

    Timer.onRefreshViewModel(() => {
      if (this.destroyed) {
        return;
      }

      this.viewModelChanged();
    }, this);
  }

  @publicMethod
  run(...args) {
    return this.contextController.run(...args);
  }

  @publicMethod
  bindView(view) {
    view[DataHub.gDhName] = this.globalDataHubController;
    view[DataHub.cDhName] = this.contextController;
    view[DataHub.dhName] = this.defaultController;
    view[DataHub.myDhName] = this.dataHubController;
    view[DataHub.runName] = (...args) => this.run(...args);
    this.viewInstance = view;
  }

  @publicMethod
  setViewStatus(value) {
    Object.assign(this.data, value);
    Timer.refreshViewModel();
    if (this.shouldRefreshView()) {
      Timer.refreshView();
    }
  }

  shouldRefreshView() {
    return true;
  }

  viewModelChanged() {

  }

  destruction() {

    this.dataHubController && this.dataHubController.destroy();
    this.dataHubController = null;

    this.globalDataHubController && this.globalDataHubController.destroy();
    this.globalDataHubController = null;

    this.viewContext && !this.viewContext.destroyed && this.viewContext.removeNode(this.key);
    this.viewContext = null;

    this.contextController && this.contextController.destroy();
    this.contextController = null;

    this.dataHub && this.dataHub.destroy();
    this.dataHub = null;

    this.data = null;

    this.defaultController = null;

    if (this.viewInstance) {
      this.viewInstance[DataHub.gDhName] = udFun;
      this.viewInstance[DataHub.cDhName] = udFun;
      this.viewInstance[DataHub.dhName] = udFun;
      this.viewInstance[DataHub.myDhName] = udFun;
      this.viewInstance[DataHub.runName] = udFun;
      this.viewInstance = null;
    }
  }

  @publicMethod
  getParent() {
    if (!this.viewContext) {
      // this.devLog('getParent: no viewContext');
      return null;
    }

    const parentNode = this.viewContext.getParent(this.key);
    if (!parentNode) {
      return null;
    }

    return parentNode.payload;
  }

  @publicMethod
  getParentChain() {
    // this.devLog('getParentChain', this.key);
    if (!this.viewContext) {
      // this.devLog('getParentChain: no viewContext');
      return [];
    }
    return this.viewContext.getParentChain(this.key).map(node => node.payload);
  }

  @publicMethod
  getMyDataHub() {
    return this.dataHub;
  }

  @publicMethod
  getViewStatus() {
    return {
      ...this.data
    };
  }

  @publicMethod
  run(...args) {
    if (!this.viewContext) {
      this.methodErrLog('run', args, ErrorType.noViewContext);
      return;
    }

    return this.contextController.run(...args);
  }

  onChange(callback = udFun) {
    if (this.destroyed) {
      return;
    }

    this.changeHandle = callback;
  }

}

export {
  ViewModel
}
