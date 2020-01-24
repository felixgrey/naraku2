import ViewContext from '../ViewModel/ViewContext'
import ViewModel from '../ViewModel/ViewModel'

import {
  uidSeed,
  createLog,
  isNvl,
  isBlank,
  udFun
} from '../Utils';

import Union from '../Common/Union';
import Emitter from '../Common/Emitter';

let PropTypes = {};

const viewContextField = 'viewContext-' + uidSeed;
const parentKeyField = 'parentKey-' + uidSeed;

export function setPropTypes(v) {
  PropTypes = v;
}

export function viewMethod(prototype2, name, descriptor) {
  if (!prototype2.viewMethods) {
    prototype2.viewMethods = [];
  }
  prototype2.viewMethods.push(name);

  return descriptor;
}

export function destructProps(props = {}) {
  const newProps = {
    ...props,
    children: [],
  };

  newProps.children = [].concat(props.children).filter(c => !isNvl(c)).map(child => {
    const newChildProps = {
      viewKey: child.key,
      children: [],
      ...child.props,
    };

    return destructProps(newChildProps);
  });

  return newProps;
}

export function createView(dhConfig = {}, ViewModelClass = ViewModel, contextView = false) {

  return function(Component) {
    class ProxyComponent extends Component {
      constructor(props = {}, context) {
        super(props, context);

        this.viewType = Component.name;
        this.viewMethods = {};
        (Component.prototype.viewMethods || []).forEach(method => {
          this.viewMethods[method] = (...args) => this[method](...args);
        });

        this.clazz = isBlank(Component.name) ? 'ReactView' : Component.name;
        this.devMode = dhConfig.$devMode || false;
        this.name = isNvl(props.myName) ? null : props.myName;

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
          this.parentKey = isNvl(context[parentKeyField]) ? null : context[parentKeyField];
          const viewContext = isNvl(context[viewContextField]) ? null : context[viewContextField];

          if (viewContext) {
            viewContext.setParent(this.parentKey);
            this.viewContext = viewContext;
            this.devMode = viewContext.devMode;

            this.union = viewContext.union.clone();
            this.union.devLog = this.union.devLog.createLog(this.logName);
            this.union.errLog = this.union.errLog.createLog(this.logName);

            if (contextView) {
              this.union.errLog(`contextView can't be in contextView`);
            }
          }
        }

        if (!this.union) {
          const union = createUnion();
          union.bindUnion(this);

          if (contextView) {
            this.viewContext = new ViewContext(dhConfig, union);
          }
        }

        this.union.clone({
          devMode: this.devMode || dhConfig.$allDevMode,
        }).bindUnion(this);

        const viewProps = {
          ...destructProps(props),
          viewType: this.viewType,
          viewMethods: this.viewMethods,
          parentKey: this.parentKey,
          myName: this.name,
          viewProps: true,
        };

        this.viewModel = new ViewModelClass(viewProps, contextView ? null : dhConfig, this.viewContext, this.union);

        this.viewModel.bindView(this);

        this.viewModelKey = this.viewModel.key;
        this.viewModel.onChange(() => {
          if (!this.rendered || this.destroyed) {
            return;
          }
          this.forceUpdate();
        });

        const getChildContext = this.getChildContext || function() {};
        this.getChildContext = function(...args) {
          return {
            ...getChildContext.bind(this)(...args),
            [viewContextField]: this.viewContext,
            [parentKeyField]: this.viewModelKey
          };
        }

        const componentDidMount = this.componentDidMount
        this.componentDidMount = function(...args) {
          this.rendered = true;
          componentDidMount && componentDidMount.bind(this)(...args);
          this.devLog(`${this.logName} componentDidMount.`);
        }

        const componentDidUpdate = this.componentDidUpdate
        this.componentDidUpdate = function(...args) {
          componentDidUpdate && componentDidUpdate.bind(this)(...args);
          this.devLog(`${this.logName} componentDidUpdate.`);
        }

        const componentWillUnmount = this.componentWillUnmount;
        this.componentWillUnmount = function(...args) {
          this.destroyed = true;
          componentWillUnmount && componentWillUnmount.bind(this)(...args);

          this.viewModel.destroy();
          this.viewModel = null;
          
          if (contextView) {
            this.viewContext.destroy();
          }
          this.viewContext = null;

          this.devLog(`${this.logName} componentWillUnmount .`);
        }

        this.afterCreateView && this.afterCreateView(props, context);
        this.devLog(`${this.logName} created.`);
      }
    }

    ProxyComponent.contextTypes = {
      ...Component.contextTypes,
      [viewContextField]: PropTypes.any,
      [parentKeyField]: PropTypes.any
    };

    ProxyComponent.childContextTypes = {
      ...Component.childContextTypes,
      [viewContextField]: PropTypes.any,
      [parentKeyField]: PropTypes.any
    };

    return ProxyComponent;
  }
}
