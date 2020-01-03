"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _LifeCycle = _interopRequireDefault(require("./../Common/LifeCycle"));

var _DataHub = _interopRequireDefault(require("./../DataHub/DataHub"));

var _Controller = _interopRequireDefault(require("./../DataHub/Controller"));

var _ViewContext = _interopRequireDefault(require("./ViewContext"));

var _Tree = _interopRequireDefault(require("./Tree.js"));

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var ViewModel = (_class = (_temp = class ViewModel extends _LifeCycle.default {
  constructor() {
    super(...arguments);
    this._momentMethods = ['destroyHandle', 'fromParent', 'onChange', 'turnOn', 'turnOff', 'run'];
  }

  _initialization() {
    var viewKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var viewType = arguments.length > 1 ? arguments[1] : undefined;
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    this._viewKey = viewKey;
    this._viewType = viewType;
    this._props = props;
    this._parentKey = null;
    this._viewContext = null;
    this._changeHandle = _Utils.udFun;
    this._moment = null;
    this._unmoment = _Utils.udFun;
    this._viewModelProps = {};
    this._name = (0, _Utils.isNvl)(props.myName) ? null : props.myName;
    this._withStore = props.withStore || null;
    this._gdhc = _DataHub.default.createController();

    this._gdhc.watch(() => {
      this._changeHandle();
    });
  }

  getParent() {
    if (!this._viewContext) {
      return null;
    }

    var parentNode = this._viewContext.getParent(this._viewKey);

    if (!parentNode) {
      return null;
    }

    return parentNode.payload;
  }

  getParentChain() {
    // this.devLog('getParentChain', this._viewKey);
    if (!this._viewContext) {
      this.devLog('getParentChain no viewContext');
      return [];
    }

    return this._viewContext.getParentChain(this._viewKey).map(node => node.payload);
  }

  fromParent(key, viewContext) {
    // this.devLog('fromParent', this._viewKey);
    if (this._destroyed || (0, _Utils.isNvl)(key) || (0, _Utils.isNvl)(viewContext)) {
      return;
    }

    if (!this._moment) {
      this.methodErrLog('fromParent', [], 'noMonent');
      return;
    }

    this._parentKey = key;
    this._viewContext = viewContext;
    this._cc = this._viewContext.getController().createController();
    this._moment._cc = this._cc;
    viewContext.createNode(this._viewKey, this._viewType, this);
    this.publicMethods(_Controller.default.publicMethods, '_cc');
    viewContext.watch(() => {
      if (_DataHub.default.isWillRefresh()) {
        return;
      }

      this._changeHandle();
    });
  }

  setMyDataHub(cfgOrDh) {
    if ((0, _Utils.isNvl)(cfgOrDh)) {
      return;
    }

    if (this._dh) {
      this.errLog("dh existed.");
      return;
    }

    if (cfgOrDh instanceof _DataHub.default) {
      this._dh = cfgOrDh;
    } else {
      this._dh = new _DataHub.default(cfgOrDh, this.devLog, this.errLog, this._devMode);
    }

    this._dh.getController().watch(() => {
      if (this._gdhc.isWillRefresh()) {
        return;
      }

      if (this._viewContext && this._viewContext.isWillRefresh()) {
        return;
      }

      this._changeHandle();
    });
  }

  getMyDataHub() {
    return this._dh;
  }

  setViewProps(value) {
    Object.assign(this._viewModelProps, value);
  }

  getViewProps() {
    return _objectSpread({}, this._viewModelProps);
  }

  createHandle(moment) {
    var _this = this;

    var preText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    if (this._destroyed) {
      return;
    }

    var format = _Utils.sameFun;

    if (preText.charAt(preText.length - 1) === '_') {
      format = method => (0, _Utils.toUnderline)(preText + method);
    } else if (preText.length) {
      format = method => (0, _Utils.toCamel)(preText + '_' + method);
    }

    this._momentMethods.forEach(method => {
      moment[format(method)] = function () {
        return _this[method](...arguments);
      };
    });

    moment[format('viewModel')] = this;
    moment._cc = _Utils.udFun;
    this._moment = moment;

    this._unmoment = () => {
      this._momentMethods.forEach(method => {
        this._moment[format(method)] = null;
      });

      this._moment[format('viewModel')] = null;
      this._moment._cc = null;
      this._moment = null;
    };
  }

  run() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (!this._viewContext) {
      this.methodErrLog('run', args, 'noViewContext');
      return;
    }

    return this._cc.run(...args);
  }

  destroyHandle() {
    if (this._destroyed) {
      return;
    }

    this._viewContext && this._viewContext.removeNode(this._viewKey);
    this.destroy();
  }

  onChange() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

    if (this._destroyed) {
      return;
    }

    this._changeHandle = callback;
  }

  _destruction() {
    this._dh && this._dh.destroy();
    this._dh = null;

    this._gdhc.destroy();

    this._gdhc = null;
    this._viewContext = null;
    this._view = null;

    this._unmoment();

    this._viewModelProps = null;
    this._props = null;
    this._cc && this._cc.destroy();
    this._cc = null;
  }

}, _temp), (_applyDecoratedDescriptor(_class.prototype, "getParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setViewProps", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setViewProps"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getViewProps", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getViewProps"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createHandle", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createHandle"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "destroyHandle", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "destroyHandle"), _class.prototype)), _class);
exports.default = ViewModel;
ViewModel.$loggerByParam = true;