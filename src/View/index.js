import ViewContext from '../ViewModel/ViewContext'
import ViewModel from '../ViewModel/ViewModel'

import {
  uidSeed,
  createLog,
  isNvl,
  isBlank,
  udFun,
  objFun,
} from '../Utils';

import Union from '../Common/Union';
import Emitter from '../Common/Emitter';

const viewContextField = 'viewContext-' + uidSeed;
const parentKeyField = 'parentKey-' + uidSeed;

let theName = 'myName';

export function getMyNameAlias(name) {
  return theName;
}

export function setMyNameAlias(name) {
  theName = name;
}

class View {

  viewCreated() {
    this.viewModel.viewCreated();
    this.viewInstance.afterCreateView && this.viewInstance.afterCreateView();
  };

  viewMounted() {
    this.rendered = true;
    this.viewModel.viewRendered();
    this.devLog(`${this.logName} viewMounted.`);
  };

  viewWillUpdate() {
    this.viewModel.viewWillChange();
  };

  viewUpdated() {
    this.viewModel.viewUpdated();
    this.devLog(`${this.logName} viewUpdated.`);
  };

  viewWillDestroyed() {
    this.destroyed = true;
    this.viewInstance.mdh.emit('$$destroyView', {
      key: this.key,
      value: this
    });
    this.viewInstance.mdh.emit(`$$destroyView:${this.key}`, this);
    this.viewModel.viewWillDestroyed();

    this.viewModel.destroy();
    this.viewModel = null;

    if (this.isContextView) {
      this.viewContext.destroy();
    }
    this.viewContext = null;

    this.devLog(`${this.logName} viewWillDestroyed.`);
  }

  init(dhConfig, ViewModelClass, contextView) {
    const {
      getProps = objFun,
        getContext = objFun,
        getViewMethods = objFun,
        destructProps = objFun,
        forceUpdate = objFun,
        getChildContextName = 'getChildContext',
        viewName = 'View',
        ClazzName = '',
        viewInstance = null,
    } = this.initParam;

    const props = this.props = getProps();
    const context = this.context = getContext();

    this.isContextView = contextView;
    this.viewInstance = viewInstance;
    this.viewType = ClazzName;
    this.clazz = isBlank(ClazzName) ? viewName : ClazzName;
    this.devMode = props.devMode || dhConfig.$devMode || false;
    this.name = isNvl(props[theName]) ? null : props[theName];
    this.key = isNvl(props.key) ? '' : props.key;
    this.viewMethods = getViewMethods();

    if (isNvl(this.name) && dhConfig.$myName) {
      this.name = dhConfig.$myName;
    }

    this.notWatchIt = !!dhConfig.$notWatchIt;

    const name2 = isNvl(this.name) ? '' : '@' + this.name;
    this.logName = `${this.clazz}${name2}`;

    this.parentKey = null;
    this.viewContext = null;
    this.rendered = false;
    this.destroyed = false;

    const createUnion = () => {
      const union = new Union({
        devMode: dhConfig.$allDevMode,
        devLog: createLog(this.logName, 'log'),
        errLog: createLog(this.logName, 'error'),
      });

      new Emitter(union);
      return union;
    }

    if (typeof context === 'object') {
      this.parentKey = isNvl(context[parentKeyField]) ? null : context[
        parentKeyField];
      const viewContext = isNvl(context[viewContextField]) ? null : context[
        viewContextField];

      if (viewContext) {
        viewContext.setParent(this.parentKey);
        this.viewContext = viewContext;
        this.devMode = this.devMode || viewContext.devMode;

        this.union = viewContext.union.clone();
        this.union.devLog = this.union.devLog.createLog(this.logName);
        this.union.errLog = this.union.errLog.createLog(this.logName);

        if (contextView) {
          this.union.errLog(`contextView can't be in contextView`);
        }
      }

      // console.log(this.name, contextView, this.devMode, viewContext, this.union)

      if (!this.union) {
        const union = createUnion();
        union.bindUnion(this);
        if (contextView) {
          this.viewContext = new ViewContext(dhConfig, union);
        }
      }

      this.union.clone({
        devMode: props.devMode || dhConfig.$devMode || dhConfig.$allDevMode,
      }).bindUnion(this);

      const viewProps = {
        notWatchIt: this.notWatchIt,
        ...this.props,
        viewType: this.viewType,
        viewMethods: this.viewMethods,
        parentKey: this.parentKey,
        myName: this.name,
        viewProps: true,
      };

      this.viewModel = new ViewModelClass(
        viewProps, contextView ? null : dhConfig,
        this.viewContext,
        this.union);

      this.viewModel.bindView(viewInstance);
      this.viewModelKey = this.viewModel.key;
      this.viewModel.onChange((parent) => {
        if (!this.rendered || this.destroyed || parent) {
          return;
        }
        forceUpdate();
      });

      const getChildContext = viewInstance[getChildContextName] || objFun;
      viewInstance[getChildContextName] = (...args) => {
        return {
          ...getChildContext.bind(viewInstance)(...args),
          [viewContextField]: this.viewContext,
          [parentKeyField]: this.viewModelKey
        };
      }
    } else {
      this.union.errLog('View not has context.');
    }
  }

  constructor(param = {}) {
    this.initParam = param;
  }

}

function createPage(createView) {
  return function page(dhConfigOrComponent) {
    if (typeof dhConfigOrComponent === 'function') {
      return createView({
        $childUseMyDataHub: true
      }, undefined, true)(dhConfigOrComponent);
    }

    if (!dhConfigOrComponent.hasOwnProperty('$childUseMyDataHub')) {
      dhConfigOrComponent.$childUseMyDataHub = true;
    }

    return createView(dhConfigOrComponent, undefined, true);
  };
}

function createComponent(createView) {
  return function component(dhConfigOrComponent, ViewModelClass) {
    if (typeof dhConfigOrComponent === 'function') {
      return createView(dhConfigOrComponent.dataHubConfig || {}, undefined, false)(dhConfigOrComponent);
    }

    let hasUseDh = dhConfigOrComponent.hasOwnProperty('$useMyDataHub');
    hasUseDh = hasUseDh || dhConfigOrComponent.hasOwnProperty('$useParentDataHub');
    hasUseDh = hasUseDh || dhConfigOrComponent.hasOwnProperty('$useContextDataHub');

    if (!hasUseDh) {
      dhConfigOrComponent.$useMyDataHub = true;
    }

    if (!dhConfigOrComponent.hasOwnProperty('$childUseMyDataHub')) {
      dhConfigOrComponent.$childUseMyDataHub = true;
    }

    return createView(dhConfigOrComponent, ViewModelClass, false)
  }
}

export {
  viewContextField,
  parentKeyField,
  createPage,
  createComponent,
  View
}
