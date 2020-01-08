import ViewContext from '../ViewModel/ViewContext'
import ViewModel from '../ViewModel/ViewModel'

import {
  createLog,
  isNvl,
  isBlank,
  udFun
} from '../Utils';

import Union from '../Common/Union';
import Emitter from '../Common/Emitter';

let PropTypes = {};

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

function destructProps(props = {}) {
  const newProps = {
    children: [],
    ...props
  };

  newProps.children = [].concat(newProps.children).map(child => {
    const newChildProps = {
      viewKey: child.key,
      children: [],
      ...child.props,
    };

    return destructProps(newChildProps);
  });

  return newProps;
}

export function createView(dhConfig = {}, ViewModelClass = ViewModel, main = false) {

  return function(Component) {
    class ProxyComponent extends Component {
      constructor(props = {}, context) {
        super(props, context)

        this.viewType = Component.name;
        this.viewMethods = Component.prototype.viewMethods || [];

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

        if (main) {
          const union = createUnion();
          union.bindUnion(this);
          this.viewContext = new ViewContext(dhConfig, union);
        } else if (typeof context === 'object') {
          this.parentKey = isNvl(context.parentKey) ? null : context.parentKey;
          const viewContext = isNvl(context.viewContext) ? null : context.viewContext;

          if (viewContext) {
            viewContext.setParent(this.parentKey);
            this.viewContext = viewContext;
            this.devMode = viewContext.devMode;

            this.union = viewContext.union.clone();
            this.union.devLog = this.union.devLog.createLog(this.logName);
            this.union.errLog = this.union.errLog.createLog(this.logName);
          }
        } else {
          const union = createUnion();
          union.bindUnion(this);
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

        this.viewModel = new ViewModelClass(viewProps, main ? null : dhConfig, this.viewContext, this.union);

        this.viewModelKey = this.viewModel.key;
        this.viewModel.onChange(() => {
          if (!this.rendered || this.destroyed) {
            return;
          }
          this.forceUpdate();
        })

        const getChildContext = this.getChildContext || function() {};
        this.getChildContext = function(...args) {
          return {
            ...getChildContext.bind(this)(...args),
            viewContext: this.viewContext,
            parentKey: this.viewModelKey
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

        const componentWillUnMount = this.componentWillUnMount
        this.componentWillUnMount = function(...args) {
          this.destroyed = true;
          componentWillUnMount && componentWillUnMount.bind(this)(...args);

          this.viewModel.destroy();
          if (main) {
            this.viewContext.destroy();
          }
          this.viewContext = null;

          this.devLog(`${this.logName} componentWillUnMount.`);
        }

        this.afterCreateView && this.afterCreateView(props, context);
        this.devLog(`${this.logName} created.`);
      }
    }

    ProxyComponent.contextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any
    };

    ProxyComponent.childContextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any
    };

    return ProxyComponent;
  }
}

export function createMainView(dhConfig, ViewModelClass) {
  return createView(dhConfig, ViewModelClass, true)
}

export function createSubView(dhConfig, ViewModelClass) {
  return createView(dhConfig, ViewModelClass, false)
}
