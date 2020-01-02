import ViewContext from '../ViewModel/ViewContext';
import ViewModel from '../ViewModel/ViewModel';

import {
  getUniIndex,
  createLog,
  isNvl,
  udFun,
} from '../Utils';

let PropTypes = {};

export function setPropTypes(v) {
  PropTypes = v;
}

export function createView(dhConfig = {}, _main = false) {
  return function(Component) {
    const ProxyComponent = function ReactView(props = {}, context = {}) {
      const result = new (Component.bind(this))(props, context);

      this._clazz = Component.name || 'ReactView';
      this._viewKey = getUniIndex();
      this._devMode = dhConfig.$devMode || false;
      this._name = isNvl(props.myName) ? null : props.myName;
      this._logName = `${this._clazz}${isNvl(this._name) ? '' : `@${this._name}`}=${this._viewKey}`;

      this._parentKey = null;
      this._viewContext = null;
      this._rendered = false;

      this.devLog = this._devMode ? createLog(this._logName, 'log') : udFun;
      this.errLog = createLog(this._logName, 'error');

      this._viewModel = new ViewModel(this._viewKey, {
        ...props,
      }, this.devLog, this.errLog, this._devMode);

      this._viewModel.createHandle(this, 'view');

      if (_main) {
        this._parentKey = this._viewKey;
        this._viewContext = new ViewContext(dhConfig, this.devLog, this.errLog, this._devMode);
        this._viewModel.setMyDataHub(this._viewContext.getDataHub());
        if (context.viewContext) {
          this.errLog('MainView can\'t be in MainView');
        }
      } else {
        this._viewContext = context.viewContext || null;
        this._parentKey = context.parentKey || null;
        this._viewModel.setMyDataHub(dhConfig);
      }

      this._viewModel.fromParent(this._parentKey, this._viewContext);

      this.viewOnChange(() => {
        if (!this._rendered) {
          return;
        }
        this.forceUpdate();
      });

      this.turnOn = this.viewTurnOn;
      this.turnOff = this.viewTurnOff;
      this.viewModel = this._viewModel;

      this.devLog(`${this._logName} created.`);

      this.getChildContext = function() {
        if (this._viewContext) {
          this._viewContext.setParent(this._viewKey);
        }

        return {
          viewContext: this._viewContext,
          parentKey: this._viewKey,
        };
      };

      const _componentDidMount = Component.prototype.componentDidMount;
      this.componentDidMount = function() {
        _componentDidMount && _componentDidMount.bind(this)();
        this._rendered = true;
      };

      const _componentWillUnMount = Component.prototype.componentWillUnMount;
      this.componentWillUnMount = function() {
        _componentWillUnMount && _componentWillUnMount.bind(this)();

        this.viewDestroyHandle();

        if (_main) {
          this._viewContext.destroy();
        }

        this._viewContext = null;
        this._viewKey = null;

        this.devLog(`${this._logName} unmount.`);
      };

      this.devLog(`${this._logName} created.`);
    };

    function Prototype() {}
    Prototype.prototype = Component.prototype;
    ProxyComponent.prototype = new Prototype();

    ProxyComponent.contextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any,
    };

    ProxyComponent.childContextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any,
    };

    return ProxyComponent;
  };
}

export function createMainView(dhConfig) {
  return createView(dhConfig, true);
}

export function createSubView(dhConfig) {
  return createView(dhConfig, false);
}
