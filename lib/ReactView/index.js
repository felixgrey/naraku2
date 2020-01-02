"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPropTypes = setPropTypes;
exports.createView = createView;
exports.createMainView = createMainView;
exports.createSubView = createSubView;

var _ViewContext = _interopRequireDefault(require("./../ViewModel/ViewContext"));

var _ViewModel = _interopRequireDefault(require("./../ViewModel/ViewModel"));

var _Utils = require("./../Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PropTypes = {};

function setPropTypes(v) {
  PropTypes = v;
}

function createView() {
  var dhConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _main = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  return function (Component) {
    var ProxyComponent = function ReactView() {
      var _this = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var result = new (Component.bind(this))(props, context);
      this._clazz = Component.name || 'ReactView';
      this._viewKey = (0, _Utils.getUniIndex)();
      this._devMode = dhConfig.$devMode || false;
      this._name = (0, _Utils.isNvl)(props.myName) ? null : props.myName;
      this._logName = "".concat(this._clazz).concat((0, _Utils.isNvl)(this._name) ? '' : '@' + this._name, "=").concat(this._viewKey);
      this._parentKey = null;
      this._viewContext = null;
      this._rendered = false;
      this.devLog = this._devMode ? (0, _Utils.createLog)(this._logName, 'log') : _Utils.udFun;
      this.errLog = (0, _Utils.createLog)(this._logName, 'error');
      this._viewModel = new _ViewModel.default(this._viewKey, _objectSpread({}, props), this.devLog, this.errLog, this._devMode);

      this._viewModel.createHandle(this, 'view');

      if (_main) {
        this._parentKey = this._viewKey;
        this._viewContext = new _ViewContext.default(dhConfig, this.devLog, this.errLog, this._devMode);

        this._viewModel.setMyDataHub(this._viewContext.getDataHub());

        if (context.viewContext) {
          this.errLog("MainView can't be in MainView");
        }
      } else {
        this._viewContext = context.viewContext || null;
        this._parentKey = context.parentKey || null;

        this._viewModel.setMyDataHub(dhConfig);
      }

      this._viewModel.fromParent(this._parentKey, this._viewContext);

      this.viewOnChange(function () {
        if (!_this._rendered) {
          return;
        }

        _this.forceUpdate();
      });
      this.turnOn = this.viewTurnOn;
      this.turnOff = this.viewTurnOff;
      this.viewModel = this._viewModel;
      this.devLog("".concat(this._logName, " created."));

      this.getChildContext = function () {
        if (this._viewContext) {
          this._viewContext.setParent(this._viewKey);
        }

        return {
          viewContext: this._viewContext,
          parentKey: this._viewKey
        };
      };

      var _componentDidMount = Component.prototype.componentDidMount;

      this.componentDidMount = function () {
        _componentDidMount && _componentDidMount.bind(this)();
        this._rendered = true;
      };

      var _componentWillUnMount = Component.prototype.componentWillUnMount;

      this.componentWillUnMount = function () {
        _componentWillUnMount && _componentWillUnMount.bind(this)();
        this.viewDestroyHandle();

        if (_main) {
          this._viewContext.destroy();
        }

        this._viewContext = null;
        this._viewKey = null;
        this.devLog("".concat(this._logName, " unmount."));
      };

      this.devLog("".concat(this._logName, " created."));
    };

    function Prototype() {}

    ;
    Prototype.prototype = Component.prototype;
    ProxyComponent.prototype = new Prototype();
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

function createMainView(dhConfig) {
  return createView(dhConfig, true);
}

function createSubView(dhConfig) {
  return createView(dhConfig, false);
}