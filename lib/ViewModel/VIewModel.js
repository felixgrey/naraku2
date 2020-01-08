"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewModel = exports.default = void 0;

var _Utils = require("./../Utils");

var _LifeCycle = _interopRequireDefault(require("./../Common/LifeCycle"));

var _DataHub = _interopRequireDefault(require("./../DataHub/DataHub"));

var _Controller = _interopRequireDefault(require("./../DataHub/Controller"));

var _ErrorType = _interopRequireDefault(require("../Common/ErrorType"));

var _ViewContext = _interopRequireDefault(require("./ViewContext"));

var _Timer = _interopRequireDefault(require("../Common/Timer"));

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
  initialization() {
    var viewProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dhConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var viewContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    this.viewProps = viewProps;
    this.changeHandle = _Utils.udFun;
    this.data = {}; // 初始化

    this.viewType = (0, _Utils.isNvl)(viewProps.viewType) ? 'View' : viewProps.viewType;
    this.viewMethods = (0, _Utils.isNvl)(viewProps.viewMethods) ? {} : viewProps.viewMethods;
    this.parentKey = (0, _Utils.isNvl)(viewProps.parentKey) ? null : viewProps.parentKey;
    this.name = (0, _Utils.isNvl)(viewProps.myName) ? null : viewProps.myName;
    this.withStore = (0, _Utils.isNvl)(viewProps.withStore) ? null : viewProps.withStore;
    this.updateLogger();
    this.globalDataHubController = _DataHub.default.createController();

    _Timer.default.onRefreshView(() => {
      this.changeHandle();
    }, this);

    _Controller.default.publicMethods.forEach(method => {
      this[method] = _Utils.udFun;
    });

    if (!(viewContext instanceof _ViewContext.default)) {
      this.errLog("".concat(this.logName, " not has ViewContext."));
    } else {
      viewContext.createNode(this.key, this.viewType, this);
      this.viewContext = viewContext;
      this.contextController = viewContext.getController().createController();
      this.publicMethods(_Controller.default.publicMethods, 'contextController');

      if (!(0, _Utils.isNvl)(this.name)) {
        for (var method in this.viewMethods) {
          this.contextController.register(method, this.viewMethods[method]);
        }
      }
    } // 根视图


    if (this.viewContext && (0, _Utils.isNvl)(dhConfig)) {
      this.dataHub = this.viewContext.getDataHub();
    } else {
      this.dataHub = new _DataHub.default(dhConfig, this.union);
    }

    _Timer.default.onRefreshViewModel(() => {
      if (this.destroyed) {
        return;
      }

      this.viewModelChanged();
    }, this);
  }

  setViewStatus(value) {
    Object.assign(this.data, value);

    _Timer.default.refreshViewModel();
  }

  viewModelChanged() {}

  destruction() {
    this.dataHub && this.dataHub.destroy();
    this.dataHub = null;
    this.globalDataHubController && this.globalDataHubController.destroy();
    this.globalDataHubController = null;
    this.viewContext && this.viewContext.removeNode(this.key);
    this.viewContext = null;
    this.contextController && this.contextController.destroy();
    this.contextController = null;
    this.data = null;
  }

  getParent() {
    if (!this.viewContext) {
      // this.devLog('getParent: no viewContext');
      return null;
    }

    var parentNode = this.viewContext.getParent(this.key);

    if (!parentNode) {
      return null;
    }

    return parentNode.payload;
  }

  getParentChain() {
    // this.devLog('getParentChain', this.key);
    if (!this.viewContext) {
      // this.devLog('getParentChain: no viewContext');
      return [];
    }

    return this.viewContext.getParentChain(this.key).map(node => node.payload);
  }

  getMyDataHub() {
    return this.dataHub;
  }

  getViewStatus() {
    return _objectSpread({}, this.data);
  }

  run() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (!this.viewContext) {
      this.methodErrLog('run', args, _ErrorType.default.noViewContext);
      return;
    }

    return this.contextController.run(...args);
  }

  destroyHandle() {
    if (this.destroyed) {
      return;
    }

    this.viewContext && this.viewContext.removeNode(this.key);
    this.destroy();
  }

  onChange() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

    if (this.destroyed) {
      return;
    }

    this.changeHandle = callback;
  }

}, (_applyDecoratedDescriptor(_class.prototype, "setViewStatus", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setViewStatus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getViewStatus", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getViewStatus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "destroyHandle", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "destroyHandle"), _class.prototype)), _class);
exports.ViewModel = exports.default = ViewModel;