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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PropTypes = {};

function setPropTypes(v) {
  PropTypes = v;
}

function viewMethod(_prototype, name, descriptor) {
  if (!_prototype._viewMethods) {
    _prototype._viewMethods = [];
  }

  _prototype._viewMethods.push(name);

  return descriptor;
}

function createView() {
  var dhConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ViewModelClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _ViewModel.default;

  var _main = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  return function (Component) {
    class ProxyComponent extends Component {
      constructor() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var context = arguments.length > 1 ? arguments[1] : undefined;
        super(props, context);
        this._viewType = Component.name;
        this._viewMethods = Component.prototype._viewMethods || [];
        this._clazz = (0, _Utils.isBlank)(Component.name) ? 'ReactView' : Component.name;
        this._devMode = dhConfig.$devMode || false;
        this._name = (0, _Utils.isNvl)(props.myName) ? null : props.myName;
        this._withStore = (0, _Utils.isNvl)(props.withStore) ? null : props.withStore;

        var __name = (0, _Utils.isNvl)(this._name) ? '' : '@' + this._name;

        this._logName = "".concat(this._clazz).concat(__name);
        this._parentKey = null;
        this._viewContext = null;
        this._rendered = false;

        if (_main) {
          this.errLog = (0, _Utils.createLog)(this._logName, 'error');
          this.devLog = this._devMode ? (0, _Utils.createLog)(this._logName, 'log') : _Utils.udFun;
          this._viewContext = new _ViewContext.default(dhConfig, this.devLog, this.errLog, this._devMode);
        } else if (typeof context === 'object') {
          this._parentKey = (0, _Utils.isNvl)(context.parentKey) ? null : context.parentKey;
          var viewContext = (0, _Utils.isNvl)(context.viewContext) ? null : context.viewContext;

          if (viewContext) {
            this._viewContext = viewContext;
            this._devMode = viewContext._devMode;
            this.errLog = viewContext.errLog.createLog(this._logName, 'error');
            this.devLog = this._devMode ? viewContext.devLog.createLog(this._logName, 'log') : _Utils.udFun;
          }
        } else {
          this.errLog = (0, _Utils.createLog)(this._logName, 'error');
          this.devLog = this._devMode ? (0, _Utils.createLog)(this._logName, 'log') : _Utils.udFun;
        }

        var viewProps = {
          viewType: this._viewType,
          viewMethods: this._viewMethods,
          parentKey: this._parentKey,
          myName: this._name,
          withStore: this._withStore
        };
        this.viewModel = new _ViewModel.default(viewProps, _main ? null : dhConfig, this._viewContext, this.devLog, this.errLog, this._devMode);
        this._viewKey = this.viewModel._key;
        this.viewModel.onChange(() => {
          if (!this._rendered) {
            return;
          }

          this.forceUpdate();
        });

        var _getChildContext = this.getChildContext || function () {};

        this.getChildContext = function () {
          if (this._viewContext) {
            this._viewContext.setParent(this._viewKey);
          }

          return _objectSpread({}, _getChildContext.bind(this)(...arguments), {
            viewContext: this._viewContext,
            parentKey: this._viewKey
          });
        };

        var _componentDidMount = this.componentDidMount;

        this.componentDidMount = function () {
          _componentDidMount && _componentDidMount.bind(this)(...arguments);
          this._rendered = true;
          this.devLog("".concat(this._logName, " componentDidMount."));
        };

        var _componentDidUpdate = this.componentDidUpdate;

        this.componentDidUpdate = function () {
          _componentDidUpdate && _componentDidUpdate.bind(this)(...arguments);
          this.devLog("".concat(this._logName, " componentDidUpdate."));
        };

        var _componentWillUnMount = this.componentWillUnMount;

        this.componentWillUnMount = function () {
          _componentWillUnMount && _componentWillUnMount.bind(this)(...arguments);
          this.viewModel.destroy();

          if (_main) {
            this._viewContext.destroy();
          }

          this._viewContext = null;
          this.devLog("".concat(this._logName, " unmount."));
        };

        this.afterCreateView && this.afterCreateView(props, context);
        this.devLog("".concat(this._logName, " created."));
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