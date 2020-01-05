import ViewContext from '../ViewModel/ViewContext'
import ViewModel from '../ViewModel/ViewModel'

import {
  createLog,
  isNvl,
  isBlank,
  udFun
} from '../Utils'

let PropTypes = {};

export function setPropTypes(v) {
  PropTypes = v
}

export function viewMethod(_prototype, name, descriptor) {
  if (!_prototype._viewMethods) {
    _prototype._viewMethods = []
  }
  _prototype._viewMethods.push(name)

  return descriptor;
}

export function createView(dhConfig = {}, ViewModelClass = ViewModel, _main = false) {
  return function(Component) {
    class ProxyComponent extends Component {
      constructor(props = {}, context) {
        super(props, context)

        this._viewType = Component.name;
        this._viewMethods = Component.prototype._viewMethods || [];

        this._clazz = isBlank(Component.name) ? 'ReactView' : Component.name;
        this._devMode = dhConfig.$devMode || false;
        this._name = isNvl(props.myName) ? null : props.myName;
        this._withStore = isNvl(props.withStore) ? null : props.withStore;

        const __name = isNvl(this._name) ? '' : '@' + this._name;
        this._logName = `${this._clazz}${__name}`;

        this._parentKey = null;
        this._viewContext = null;
        this._rendered = false;

        if (_main) {
          this.errLog = createLog(this._logName, 'error');
          this.devLog = this._devMode ? createLog(this._logName, 'log') : udFun;

          this._viewContext = new ViewContext(dhConfig, this.devLog, this.errLog, this._devMode);
        } else if (typeof context === 'object') {
          this._parentKey = isNvl(context.parentKey) ? null : context.parentKey;
          const viewContext = isNvl(context.viewContext) ? null : context.viewContext;

          if (viewContext) {
            this._viewContext = viewContext;
            this._devMode = viewContext._devMode;

            this.errLog = viewContext.errLog.createLog(this._logName, 'error');
            this.devLog = this._devMode ? viewContext.devLog.createLog(this._logName, 'log') : udFun;
          }
        } else {
          this.errLog = createLog(this._logName, 'error');
          this.devLog = this._devMode ? createLog(this._logName, 'log') : udFun;
        }

        const viewProps = {
          viewType: this._viewType,
          viewMethods: this._viewMethods,
          parentKey: this._parentKey,
          myName: this._name,
          withStore: this._withStore,
        };

        this.viewModel = new ViewModel(viewProps,
          _main ? null : dhConfig, this._viewContext, this.devLog, this.errLog, this._devMode);

        this._viewKey = this.viewModel._key;
        this.viewModel.onChange(() => {
          if (!this._rendered) {
            return;
          }
          this.forceUpdate();
        })

        const _getChildContext = this.getChildContext || function() {}
        this.getChildContext = function(...args) {
          if (this._viewContext) {
            this._viewContext.setParent(this._viewKey)
          }

          return {
            ..._getChildContext.bind(this)(...args),
            viewContext: this._viewContext,
            parentKey: this._viewKey
          }
        }

        const _componentDidMount = this.componentDidMount
        this.componentDidMount = function(...args) {
          _componentDidMount && _componentDidMount.bind(this)(...args)
          this._rendered = true
          this.devLog(`${this._logName} componentDidMount.`)
        }

        const _componentDidUpdate = this.componentDidUpdate
        this.componentDidUpdate = function(...args) {
          _componentDidUpdate && _componentDidUpdate.bind(this)(...args)
          this.devLog(`${this._logName} componentDidUpdate.`)
        }

        const _componentWillUnMount = this.componentWillUnMount
        this.componentWillUnMount = function(...args) {
          _componentWillUnMount && _componentWillUnMount.bind(this)(...args)

          this.viewModel.destroy();
          if (_main) {
            this._viewContext.destroy();
          }
          this._viewContext = null
          this.devLog(`${this._logName} unmount.`)
        }

        this.afterCreateView && this.afterCreateView(props, context);
        this.devLog(`${this._logName} created.`);
      }
    }

    ProxyComponent.contextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any
    }

    ProxyComponent.childContextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any
    }

    return ProxyComponent
  }
}

export function createMainView(dhConfig, ViewModelClass) {
  return createView(dhConfig, ViewModelClass, true)
}

export function createSubView(dhConfig, ViewModelClass) {
  return createView(dhConfig, ViewModelClass, false)
}
