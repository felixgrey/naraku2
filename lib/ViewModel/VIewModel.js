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

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var ViewModel = (_class = class ViewModel extends _LifeCycle.default {
  _initialization() {
    var viewProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dhConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var viewContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    this._viewProps = viewProps;
    this._viewStatus = {};
    this._changeHandle = _Utils.udFun;
    this._viewType = (0, _Utils.isNvl)(viewProps.viewType) ? 'View' : viewProps.viewType;
    this._viewMethods = (0, _Utils.isNvl)(viewProps.viewMethods) ? {} : viewProps.viewMethods;
    this._parentKey = (0, _Utils.isNvl)(viewProps.parentKey) ? null : viewProps.parentKey;
    this._name = (0, _Utils.isNvl)(viewProps.myName) ? null : viewProps.myName;
    this._withStore = (0, _Utils.isNvl)(viewProps.withStore) ? null : viewProps.withStore;
    this._gdhc = _DataHub.default.createController();

    this._gdhc.watch(() => {
      this._changeHandle();
    });

    _Controller.default.publicMethods.forEach(method => {
      this[method] = _Utils.udFun;
    });

    if (!viewContext instanceof _ViewContext.default) {
      this.errLog("".concat(this._logName, " not has ViewContext."));
    } else {
      viewContext.createNode(this._key, this._viewType, this);
      this._viewContext = viewContext;
      this._cc = viewContext.getController().createController();
      this.publicMethods(_Controller.default.publicMethods, '_cc');

      this._cc.watch(() => {
        if (_DataHub.default.isWillRefresh()) {
          return;
        }

        this._changeHandle();
      });

      if (!(0, _Utils.isNvl)(this._name)) {
        for (var method in this._viewMethods) {
          this._cc.register(method, this._viewMethods[method]);
        }
      }
    }

    if (viewContext && (0, _Utils.isNvl)(dhConfig)) {
      this._dh = viewContext.getDataHub();
    } else {
      this._dh = new _DataHub.default(dhConfig, this.devLog, this.errLog, this._devMode);
    }
  }

  getParent() {
    if (!this._viewContext) {
      // this.devLog('getParent: no viewContext');
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
      // this.devLog('getParentChain: no viewContext');
      return [];
    }

    return this._viewContext.getParentChain(this._viewKey).map(node => node.payload);
  }

  getMyDataHub() {
    return this._dh;
  }

  setViewStatus(value) {
    Object.assign(this._viewStatus, value);

    this._cc.emit('$$data', {
      name: '$$viewStatus',
      value
    });
  }

  getViewStatus() {
    return _objectSpread({}, this._viewStatus);
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

    this._viewContext && this._viewContext.removeNode(this._key);
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
    this._viewContext && this._viewContext.removeNode(this._key);
    this._viewContext = null;
    this._viewStatus = null;
    this._cc && this._cc.destroy();
    this._cc = null;
  }

}, (_applyDecoratedDescriptor(_class.prototype, "getParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setViewStatus", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setViewStatus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getViewStatus", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getViewStatus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "destroyHandle", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "destroyHandle"), _class.prototype)), _class);
exports.default = ViewModel;
ViewModel.$loggerByParam = true;