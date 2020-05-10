import ViewModel from '../ViewModel/ViewModel';
import DataHub from '../DataHub/DataHub';

import {
  isBlank,
  objFun,
  doNothing,
} from '../Utils';

import {
  View,
  createComponent,
  createPage,
  getMyNameAlias
} from '../View';

function createView(dhConfig = {}, ViewModelClass = ViewModel, contextView = false) {

  const theName = getMyNameAlias();

  return function(VueShell) {

    const vueConfig = {
      vue: {},
      ...new VueShell()
    }.vue;

    const {
      name = null,
        props = [],
        beforeCreate = doNothing,
        created = doNothing,
        beforeMount = doNothing,
        mounted = doNothing,
        beforeUpdate = doNothing,
        updated = doNothing,
        beforeDestroy = doNothing,
        destroyed = doNothing,
        methods = {},
        getChildContext = objFun,
        afterCreateView,
    } = vueConfig;

    vueConfig.name = isBlank(name) ? VueShell.name : name;

    if (Array.isArray(props)) {
      const propsSet = new Set([theName, 'devMode', 'withStore', 'watchStores', 'notWatchIt', ...props]);
      vueConfig.props = Array.from(propsSet.values());
    } else {
      vueConfig.props = {
        [theName]: {
          type: String,
          default: undefined,
        },
        devMode: {
          type: Boolean,
          default: false,
        },
        withStore: {
          type: String,
          default: '',
        },
        watchStores: {
          type: Array,
          default: () => [],
        },
        notWatchIt: {
          type: Boolean,
          default: false
        },
        ...props
      }
    }

    vueConfig.beforeMount = function(...args) {
      this.$$View.viewCreated();
      return beforeMount.bind(this)(...args);
    }

    vueConfig.mounted = function(...args) {
      this.$$View.viewMounted();
      return mounted.bind(this)(...args);
    }

    vueConfig.beforeUpdate = function(...args) {
      this.$$View.viewWillUpdate();
      return beforeUpdate.bind(this)(...args);
    }

    vueConfig.updated = function(...args) {
      this.$$View.viewUpdated();
      return updated.bind(this)(...args);
    }

    vueConfig.beforeDestroy = function(...args) {
      this.$$View.viewWillDestroyed();
      return beforeDestroy.bind(this)(...args);
    }

    vueConfig.created = function(...args) {

      const myContext = contextView ? {} : null;

      this.$$View = new View({
        getChildContextName: '$getChildContext',
        viewName: 'VueView',
        viewInstance: this,
        ClazzName: VueShell.name,
        forceUpdate: () => {
          this.$forceUpdate();
        },
        getViewMethods: () => {
          const viewMethods = {};

          Object.values(methods).forEach(fun => {
            if (fun.isViewMethod !== undefined) {
              viewMethods[fun.isViewMethod] = (...args) => fun.bind(this)(...
                args);
            }
          });

          return viewMethods;
        },
        getProps: () => {
          let propNames = [];

          if (Array.isArray(vueConfig.props)) {
            propNames = vueConfig.props;
          } else {
            propNames = Object.keys(vueConfig.props);
          }

          const props = {};
          propNames.forEach(name => {
            props[name] = this[name];
          });

          return props;
        },
        getContext: () => {
          if (contextView) {
            return myContext;
          }

          if (this.$parent) {
            return this.$parent.$getChildContext();
          }

          return {};
        }
      });

      this.$$View.init(dhConfig, ViewModelClass, contextView);

      return created.bind(this)(...args);
    }

    return vueConfig;
  }
}

function viewMethod(methods, name) {
  methods[name].isViewMethod = name;
}

class VueShell {
  isVueShell = true;
};

const page = createPage(createView);
const component = createComponent(createView);

function setContextManager(Vue) {

  Vue.prototype.$getChildContext = function() {
    if (this.$$View) {
      return this.$$View.context || {};
    }

    if (this.$parent) {
      return this.$parent.$getChildContext();
    }

    return {};
  }
}

export {
  setContextManager,
  VueShell,
  createView,
  page,
  component,
  viewMethod
}
