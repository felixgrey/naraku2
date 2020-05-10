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

  parentWillUpdateView() {
    return false;
  }

  initialization(viewProps = {}, dhConfig = null, viewContext = null) {
    this.viewProps = viewProps;
    this.changeHandle = udFun;
    this.data = {};
    this.parents = [];
    this.contextController = null;
    this.parentController = null;

    const {
      viewType,
      viewMethods,
      myName,
      parentKey,
      withStore,
      notWatchIt = false,
      watchStores,
      watchAll,
      useContextDataHub,
      useMyDataHub,
      useParentDataHub,
    } = viewProps;

    // 初始化
    this.viewType = isNvl(viewType) ? 'View' : viewType;
    this.viewMethods = isNvl(viewMethods) ? {} : viewMethods;
    this.parentKey = isNvl(parentKey) ? null : parentKey;
    this.notWatchIt = notWatchIt;
    this.withStore = isNvl(withStore) ? null : withStore;
    this.watchStores = isNvl(watchStores) ? [] : [].concat(watchStores);
    this.name = (!isNvl(myName)) ? myName : (dhConfig && dhConfig.$myName) ? dhConfig.$myName : null;

    if (watchAll === false) {
      this.watchAll = false;
    } else if (dhConfig && dhConfig.$watchAll === false) {
      this.watchAll = false;
    } else {
      this.watchAll = watchAll || (dhConfig && dhConfig.$watchAll) || null;
    }

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
    this.defaultController = this.dataHubController;

    const {
      $useMyDataHub = false,
        $useParentDataHub = false,
        $useContextDataHub = false,
    } = this.dataHub.cfg;

    let parents = this.parents = [];
    if (this.viewContext) {
      parents = this.parents = this.viewContext.getParentChain(this.key);
    }

    for (let parent of parents) {
      const {
        $childUseMyDataHub = false
      } = parent.payload.dataHub.cfg;

      if ($childUseMyDataHub) {
        this.defaultController = parent.payload.defaultController.createController();
        break;
      }
    }

    if (parents.length) {
      this.parentController = parents[0].payload.defaultController.createController();
      this.parentWillUpdateView = () => {
        return parents[0].payload.willUpdateView;
      }
    }

    if ($useContextDataHub) {
      this.defaultController = this.contextController;
    }

    if ($useParentDataHub && this.parentController) {
      this.defaultController = this.parentController;
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

    this.devLog(`defaultDataHub=${this.defaultController.dhKey}`);

    Timer.onRefreshView(({
      values
    }) => {
      if (this.destroyed) {
        return;
      }

      if (this.parentWillUpdateView()) {
        this.willUpdateView = true;
        this.changeHandle(true);
        return;
      }

      let flag = values.includes(-1) || values.includes(this.dataHubController.dhKey);

      if (!flag) {
        if (this.watchAll) {
          flag = true;
        } else if (this.watchAll !== false) {
          flag = DataHub.watchAll;
        }
      }

      if (!flag && !this.notWatchIt && this.withStore) {
        let dsKey = this.defaultController.getDsKey(this.withStore);
        flag = values.includes(dsKey);
      }

      if (!flag) {
        for (let name of this.watchStores) {
          let dsKey1 = this.globalDataHubController.getDsKey(name);
          let dsKey2 = this.contextController.getDsKey(name);
          let dsKey3 = this.dataHubController.getDsKey(name);

          if (values.includes(dsKey1) || values.includes(dsKey2) || values.includes(dsKey3)) {
            flag = true;
            break;
          }
        }
      };

      if (flag) {
        this.willUpdateView = true;
        this.changeHandle(false);
      }
    }, this);

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
    view[DataHub.pDhName] = this.parentController;
    view[DataHub.myDhName] = this.dataHubController;
    view[DataHub.runName] = (...args) => this.run(...args);
    view[DataHub.hasRunnerName] = (...args) => this.hasRunner(...args);
    this.viewInstance = view;
  }

  @publicMethod
  setViewStatus(value) {
    Object.assign(this.data, value);
    Timer.refreshViewModel(this.dataHubController.dhKey);
    if (this.shouldRefreshView()) {
      Timer.refreshView(this.dataHubController.dhKey);
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

    this.parentController && this.parentController.destroy();
    this.parentController = null;

    this.dataHub && this.dataHub.destroy();
    this.dataHub = null;

    this.data = null;
    this.parents = null;

    this.defaultController = null;

    if (this.viewInstance) {
      const {
        cDhName,
        dhName,
        pDhName,
        myDhName,
        runName,
        hasRunnerName
      } = DataHub;

      [
        cDhName,
        dhName,
        pDhName,
        myDhName,
        runName,
        hasRunnerName
      ].forEach(name => {
        this.viewInstance[name] = udFun;
      });

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
  viewCreated() {

  }

  @publicMethod
  viewRendered() {

  }

  @publicMethod
  viewWillChange() {

  }

  @publicMethod
  viewUpdated() {
    this.willUpdateView = false;
  }

  @publicMethod
  viewWillDestroyed() {

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
