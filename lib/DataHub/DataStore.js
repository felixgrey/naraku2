"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Container = _interopRequireDefault(require("./Container"));

var _Component = _interopRequireDefault(require("./Component"));

var _PaginationManager = _interopRequireDefault(require("./PaginationManager.js"));

var _RelationManager = _interopRequireDefault(require("./RelationManager.js"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _Container.default;
var allStatus = ['undefined', 'ready', 'loading', 'locked', 'error'];
var publicMethods = ['set', 'merge0', 'first', 'getValue', 'get', 'clear', 'isEmpty', 'getCount', 'getStatus', 'remove', 'setErrorMsg', 'getErrorMsg', 'lock', 'unLock', 'loading', 'clearLoading', 'loaded'];
var DataStore = (_class = class DataStore extends _Container.default {
  initialization() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    super.initialization(...args);
    var [dataHub, name] = args;
    this.dataHub = dataHub;
    this.dataHubController = dataHub.dataHubController;
    this.store = this;
    this.eternal = false;
    this.value = [];
    this.storeConfig = null;
    this.oldStatus = 'undefined';
    this.status = 'undefined';
    this.lockStack = 0;
    this.errMsg = null;

    if ((0, _Utils.isNvl)(name)) {
      this.errLog('DataStore must has name.');
      return;
    }

    this.name = name;
    this.paginationManager = new _PaginationManager.default(this, this.union);
    this.relationManager = new _RelationManager.default(this, this.union);
    this.publicMethods(_RelationManager.default.publicMethods, 'relationManager');
    this.containerDestroyOff = _Component.default.prototype.bindContainer.bind(this)(dataHub);
  }

  bindContainer(instance) {
    super.bindContainer(instance);
    instance.dataHub = this.dataHub;
    instance.dataHubController = this.dataHub.dataHubController;
    instance.dataStore = this;
  }

  destruction() {
    super.destruction();
    this.paginationManager && this.paginationManager.destroy();
    this.paginationManager = null;
    this.relationManager && this.relationManager.destroy();
    this.relationManager = null;
    this.containerDestroyOff();
    this.containerDestroyOff = null;
    this.value = null;
    this.storeConfig = null;
  }

  getPageInfo() {
    if (!this.paginationManager) {
      return {};
    }

    return this.paginationManager.getPageInfo();
  }

  setConfig(cfg) {
    if (this.storeConfig) {
      this.devLog("run setConfig again");
      return;
    }

    if (cfg === undefined) {
      cfg = {
        default: []
      };
    } else if (cfg === null) {
      cfg = {
        default: [null]
      };
    } else if (typeof cfg !== 'object') {
      cfg = {
        default: [cfg]
      };
    } else if (Array.isArray(cfg)) {
      cfg = {
        default: cfg
      };
    }

    ;
    Object.keys(cfg).forEach(name => {
      var value = cfg[name];

      if (/\_|\$/g.test(name.charAt(0))) {
        this.setData(name, value);
        return;
      }
    });
    this.relationManager && this.relationManager.init(cfg);
    this.paginationManager && this.paginationManager.init(cfg.pagination);
    this.storeConfig = cfg;
  }

  getExtendConfig() {
    return _objectSpread({}, this.data);
  }

  getStoreConfig() {
    return _objectSpread({}, this.storeConfig || {});
  }

  setStatus(status) {
    if (status === this.status) {
      return;
    }

    this.devLog("changeStatus :".concat(this.status, " => ").concat(status));

    if (this.status !== 'locked' && this.status !== 'loading') {
      this.oldStatus = this.status;
    }

    this.status = status;
    this.emitter.emit('$$status', {
      name: this.name,
      value: this.status
    });
    this.emitter.emit("$$status:".concat(this.name, "=").concat(this.status));
  }

  emitDataChange() {
    this.emitter.emit('$$data', {
      name: this.name,
      value: this.value
    });
    this.emitter.emit("$$data:".concat(this.name), this.value);
  }

  set(value) {
    if (this.status === 'locked' || this.status === 'loading') {
      this.methodErrLog('set', value, 'locked/loading', "can't set value when '".concat(this.name, "' is locked or loading."));
      return;
    }

    if (value === undefined) {
      value = [];
    }

    value = [].concat(value);
    this.value = value;
    this.errMsg = null;
    this.setStatus('ready');
    this.emitDataChange();
  }

  merge0(data) {
    if (this.status === 'locked' || this.status === 'loading') {
      this.methodErrLog('merge0', [data], 'locked/loading', "can't set merge0 when '".concat(this.name, "' is locked or loading."));
      return;
    }

    var value = Object.assign({}, this.first(), data);

    if (this.isEmpty()) {
      this.set(value);
    } else {
      this.value[0] = value;
      this.set(this.value);
      ;
    }
  }

  first() {
    var defaultValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return this.getValue('0', defaultValue);
  }

  getValue(path, defaultValue) {
    return (0, _Utils.getDeepValue)(this.value, path, defaultValue);
  }

  hasSet() {
    return this.getStatus() !== 'undefined';
  }

  get() {
    return this.value;
  }

  clear() {
    if (this.status === 'undefined') {
      return;
    }

    if (this.status === 'locked' || this.status === 'loading') {
      this.methodErrLog('clear', [], 'locked/loading', "can't clear when '".concat(this.name, "' is locked or loading."));
      return;
    }

    this.set([]);
  }

  isEmpty() {
    return this.getCount() === 0;
  }

  getCount() {
    return this.value.length;
  }

  getStatus() {
    return this.status;
  }

  remove() {
    if (this.eternal) {
      this.methodErrLog('remove', [], 'eternal', "can't remove eternal dataStore '".concat(this.name, "'."));
      return;
    }

    if (this.status === 'locked' || this.status === 'loading') {
      this.methodErrLog('remove', [], 'locked/loading', "can't remove when '".concat(this.name, "' is locked or loading."));
      return;
    }

    this.value = [];
    this.oldStatus = 'undefined';
    this.setStatus('undefined');
    this.emitDataChange();
  }

  isLocked() {
    return this.status === 'locked';
  }

  isLoading() {
    return this.status === 'loading';
  }

  setErrorMsg(msg) {
    if ((0, _Utils.isNvl)(msg)) {
      this.methodErrLog('setErrorMsg', [msg], 'null', "can't set null error message to '".concat(this.name, "'."));
      return;
    }

    this.errMsg = msg;
    this.setStatus('error');
  }

  getErrorMsg() {
    return this.errMsg;
  }

  lock() {
    if (this.status === 'loading') {
      this.methodErrLog('lock', [], 'loading', "can't lock  when '".concat(this.name, "' is loading."));
      return;
    }

    this.lockStack++;
    this.setStatus('locked');
  }

  unLock() {
    if (this.lockStack > 0) {
      this.lockStack--;
    }

    this.devLog("unLock: lockStack=".concat(this.lockStack, ", oldStatus=").concat(this.oldStatus));

    if (this.lockStack === 0) {
      this.setStatus(this.oldStatus);
    }
  }

  unLockAll() {
    this.lockStack = 0;
    this.unLock();
  }

  loading() {
    this.devLog("loading: status=".concat(this.status));

    if (this.status === 'locked' || this.status === 'loading') {
      this.methodErrLog('loading', [], 'locked/loading', "can't set status=loading when '".concat(this.name, "' is locked or loading."));
      return;
    }

    this.setStatus('loading');
  }

  clearLoading() {
    if (this.status === 'loading') {
      this.setStatus(this.oldStatus);
    }
  }

  loaded(value) {
    if (this.status !== 'loading') {
      this.methodErrLog('loaded', [value], 'locked/loading', "'".concat(this.name, "' isn't loading."));
      return;
    }

    if (this.status === 'locked') {
      this.methodErrLog('loaded', [value], 'locked/loading', "can't set status=".concat(this.oldStatus, " when '").concat(this.name, "' is locked."));
      return;
    }

    this.clearLoading();
    this.set(value);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "getPageInfo", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPageInfo"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setConfig", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setConfig"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getExtendConfig", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getExtendConfig"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getStoreConfig", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getStoreConfig"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "set", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "set"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "merge0", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "merge0"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "first", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "first"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getValue", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getValue"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "hasSet", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasSet"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "get", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "get"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "clear", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "clear"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isEmpty", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isEmpty"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getCount", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getCount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getStatus", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getStatus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "remove", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "remove"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLocked", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLocked"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setErrorMsg", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setErrorMsg"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getErrorMsg", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getErrorMsg"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "lock", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "lock"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unLock", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unLock"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unLockAll", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unLockAll"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "loading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "loading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "clearLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "clearLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "loaded", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "loaded"), _class.prototype)), _class);
exports.default = DataStore;
DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;