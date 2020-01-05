"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPropTypes = setPropTypes;
exports.viewMethod = viewMethod;
exports.createView = createView;
exports.createMainView = createMainView;
exports.createSubView = createSubView;

var _ViewContext = _interopRequireDefault(require("../ViewModel/ViewContext"));

var _ViewModel = _interopRequireDefault(require("../ViewModel/ViewModel"));

var _Utils = require("../Utils");

var _Union = _interopRequireDefault(require("../Common/Union"));

var _Emitter = _interopRequireDefault(require("../Common/Emitter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PropTypes = {};

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

function createView() {
  var dhConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ViewModelClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _ViewModel.default;
  var main = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return function (Component) {
    class ProxyComponent extends Component {
      constructor() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var context = arguments.length > 1 ? arguments[1] : undefined;
        super(props, context);
        this.viewType = Component.name;
        this.viewMethods = Component.prototype.viewMethods || [];
        this.clazz = (0, _Utils.isBlank)(Component.name) ? 'ReactView' : Component.name;
        this.devMode = dhConfig.$devMode || false;
        this.name = (0, _Utils.isNvl)(props.myName) ? null : props.myName;
        this.withStore = (0, _Utils.isNvl)(props.withStore) ? null : props.withStore;
        var name2 = (0, _Utils.isNvl)(this.name) ? '' : '@' + this.name;
        this.logName = "".concat(this.clazz).concat(name2);
        this.parentKey = null;
        this.viewContext = null;
        this.rendered = false;

        function createUnion() {
          var union = new _Union.default({
            devMode: this.devMode,
            devLog: (0, _Utils.createLog)(this.logName, 'log'),
            errLog: (0, _Utils.createLog)(this.logName, 'error')
          });
          new _Emitter.default(union);
          return union;
        }

        if (main) {
          var union = createUnion();
          union.bindUnion(this);
          this.viewContext = new _ViewContext.default(dhConfig, union);
        } else if (typeof context === 'object') {
          this.parentKey = (0, _Utils.isNvl)(context.parentKey) ? null : context.parentKey;
          var viewContext = (0, _Utils.isNvl)(context.viewContext) ? null : context.viewContext;

          if (viewContext) {
            this.viewContext = viewContext;
            this.devMode = viewContext.devMode;
            this.union = this.viewContext.clone();
            this.union.devLog = this.union.devLog.createLog(this.logName);
            this.union.errLog = this.union.errLog.createLog(this.logName);
          }
        } else {
          var _union = createUnion();

          _union.bindUnion(this);
        }

        var viewProps = {
          viewType: this.viewType,
          viewMethods: this.viewMethods,
          parentKey: this.parentKey,
          myName: this.name,
          withStore: this.withStore
        };
        this.viewModel = new _ViewModel.default(viewProps, main ? null : dhConfig, this.viewContext, this.union);
        this.viewKey = this.viewModel.key;
        this.viewModel.onChange(() => {
          if (!this.rendered) {
            return;
          }

          this.forceUpdate();
        });

        var getChildContext = this.getChildContext || function () {};

        this.getChildContext = function () {
          if (this.viewContext) {
            this.viewContext.setParent(this.viewKey);
          }

          return _objectSpread({}, getChildContext.bind(this)(...arguments), {
            viewContext: this.viewContext,
            parentKey: this.viewKey
          });
        };

        var componentDidMount = this.componentDidMount;

        this.componentDidMount = function () {
          componentDidMount && componentDidMount.bind(this)(...arguments);
          this.rendered = true;
          this.devLog("".concat(this.logName, " componentDidMount."));
        };

        var componentDidUpdate = this.componentDidUpdate;

        this.componentDidUpdate = function () {
          componentDidUpdate && componentDidUpdate.bind(this)(...arguments);
          this.devLog("".concat(this.logName, " componentDidUpdate."));
        };

        var componentWillUnMount = this.componentWillUnMount;

        this.componentWillUnMount = function () {
          componentWillUnMount && componentWillUnMount.bind(this)(...arguments);
          this.viewModel.destroy();

          if (main) {
            this.viewContext.destroy();
          }

          this.viewContext = null;
          this.devLog("".concat(this.logName, " componentWillUnMount."));
        };

        this.afterCreateView && this.afterCreateView(props, context);
        this.devLog("".concat(this.logName, " created."));
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
  };
}

function createMainView(dhConfig, ViewModelClass) {
  return createView(dhConfig, ViewModelClass, true);
}

function createSubView(dhConfig, ViewModelClass) {
  return createView(dhConfig, ViewModelClass, false);
}