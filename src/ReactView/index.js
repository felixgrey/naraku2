import ViewContext from '../ViewModel/ViewContext'
import ViewModel from '../ViewModel/ViewModel'

import {
  uidSeed,
  createLog,
  isNvl,
  isBlank,
  udFun,
  doNothing,
} from '../Utils';

import {
  viewContextField,
  parentKeyField,
  View,
  createComponent,
  createPage,
  getMyNameAlias
} from '../View';

import Union from '../Common/Union';
import Emitter from '../Common/Emitter';

let PropTypes = {};

function setPropTypes(v) {
  PropTypes = v;
}

function viewMethod(prototype2, name, descriptor) {
  if (!prototype2.viewMethods) {
    prototype2.viewMethods = [];
  }
  prototype2.viewMethods.push(name);

  return descriptor;
}

function destructProps(props = {}) {
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

function createView(dhConfig = {}, ViewModelClass = ViewModel, contextView = false) {

  const theName = getMyNameAlias();

  return function(Component) {
    class ProxyComponent extends Component {
      constructor(props = {}, context = {}) {
        super(props, context);

        this.$$View = new View({
          getChildContextName: 'getChildContext',
          viewName: 'ReactView',
          viewInstance: this,
          ClazzName: Component.name,
          forceUpdate: () => {
            this.forceUpdate();
          },
          getViewMethods: () => {
            const viewMethods = {};

            (Component.prototype.viewMethods || []).forEach(method => {
              viewMethods[method] = (...args) => this[method](...args);
            });

            return viewMethods;
          },
          getProps: () => {
            return destructProps(this.props);
          },
          getContext: () => {
            return context;
          }
        });

        this.$$View.init(dhConfig, ViewModelClass, contextView);

        const {
          componentWillMount = doNothing,
            componentDidMount = doNothing,
            componentWillUpdate = doNothing,
            componentDidUpdate = doNothing,
            componentWillUnmount = doNothing,
        } = this;

        this.componentWillMount = function(...args) {
          this.$$View.viewCreated();
          return componentWillMount.bind(this)(...args);
        }

        this.componentDidMount = function(...args) {
          this.$$View.viewMounted();
          return componentDidMount.bind(this)(...args);
        }

        this.componentWillUpdate = function(...args) {
          this.$$View.viewWillUpdate();
          return componentWillUpdate.bind(this)(...args);
        }

        this.componentDidUpdate = function(...args) {
          this.$$View.viewUpdated();
          return componentDidUpdate.bind(this)(...args);
        }

        this.componentWillUnmount = function(...args) {
          this.$$View.viewWillDestroyed();
          return componentWillUnmount.bind(this)(...args);
        }
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

    ProxyComponent.ViewModelClass = ViewModelClass;

    return ProxyComponent;
  }
}

const page = createPage(createView);
const component = createComponent(createView);

export {
  viewMethod,
  setPropTypes,
  destructProps,
  createView,
  page,
  component
}
