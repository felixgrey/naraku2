"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component2 = _interopRequireDefault(require("./Component"));

var _PaginationManager = _interopRequireDefault(require("./PaginationManager.js"));

var _RelationManager = _interopRequireDefault(require("./RelationManager.js"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethod = _Component2.default.publicMethod;
var allStatus = ['undefined', 'ready', 'loading', 'locked', 'error'];
var publicMethods = ['set', 'merge0', 'first', 'getValue', 'get', 'clear', 'isEmpty', 'getCount', 'getStatus', 'remove', 'setErrorMsg', 'getErrorMsg', 'lock', 'unLock', 'loading', 'clearLoading', 'loaded'];
var DataStore = (_class =
/*#__PURE__*/
function (_Component) {
  _inherits(DataStore, _Component);

  function DataStore() {
    _classCallCheck(this, DataStore);

    return _possibleConstructorReturn(this, _getPrototypeOf(DataStore).apply(this, arguments));
  }

  _createClass(DataStore, [{
    key: "afterCreate",
    value: function afterCreate(dh, name) {
      var _this = this;

      this._store = this;
      this._eternal = false;
      this._value = [];
      this._storeConfig = null;
      this._extendConfig = {};
      this._oldStatus = 'undefined';
      this._status = 'undefined';
      this._lockStack = 0;
      this._errMsg = null;
      this._name = name;

      _RelationManager.default.publicMethods.forEach(function (method) {
        _this[method] = function () {
          var _this$_relationManage;

          if (_this._destroyed) {
            return udFun;
          }

          return (_this$_relationManage = _this._relationManager)[method].apply(_this$_relationManage, arguments);
        };
      });

      this._pagination = new _PaginationManager.default(this, this._devMode);
      this._relationManager = new _RelationManager.default(this, this._devMode);
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      this._pagination.destroy();

      this._pagination = null;

      this._relationManager.destroy();

      this._relationManager = null;
      this._value = null;
      this._storeConfig = null;
      this._extendConfig = null;
    }
  }, {
    key: "getPaginationManager",
    value: function getPaginationManager() {
      if (this._destroyed) {
        return udFun;
      }

      return this._pagination;
    }
  }, {
    key: "getPageInfo",
    value: function getPageInfo() {
      return this._pagination.getPageInfo();
    }
  }, {
    key: "setConfig",
    value: function setConfig(cfg) {
      var _this2 = this;

      if (this._storeConfig) {
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
      } else if (_typeof(cfg) !== 'object') {
        cfg = {
          default: [cfg]
        };
      } else if (Array.isArray(cfg)) {
        cfg = {
          default: cfg
        };
      }

      ;
      Object.keys(cfg).forEach(function (name) {
        var value = cfg[name];

        if (/\_|\$/g.test(name.charAt(0))) {
          _this2._extendConfig[name] = value;
          return;
        }
      });

      this._relationManager.init(cfg);

      this._pagination.init(cfg.pagination);

      this._storeConfig = cfg;
    }
  }, {
    key: "getExtendConfig",
    value: function getExtendConfig() {
      return _objectSpread({}, this._extendConfig);
    }
  }, {
    key: "getStoreConfig",
    value: function getStoreConfig() {
      return _objectSpread({}, this._storeConfig || {});
    }
  }, {
    key: "_setStatus",
    value: function _setStatus(status) {
      if (status === this._status) {
        return;
      }

      this.devLog("changeStatus :".concat(this._status, " => ").concat(status));

      if (this._status !== 'locked' && this._status !== 'loading') {
        this._oldStatus = this._status;
      }

      this._status = status;

      this._emitter.emit('$$status', {
        name: this._name,
        value: this._status
      });

      this._emitter.emit("$$status:".concat(this._name, "@").concat(this._status));
    }
  }, {
    key: "_emitDataChange",
    value: function _emitDataChange() {
      this._emitter.emit('$$data', {
        name: this._name,
        value: this._value
      });

      this._emitter.emit("$$data:".concat(this._name), this._value);
    }
  }, {
    key: "set",
    value: function set(value) {
      if (this._status === 'locked' || this._status === 'loading') {
        this.methodErrLog('set', value, 'locked/loading', "can't set value when '".concat(this._name, "' is locked or loading."));
        return;
      }

      if (value === undefined) {
        value = [];
      }

      value = [].concat(value);
      this._value = value;
      this._errMsg = null;

      this._setStatus('ready');

      this._emitDataChange();
    }
  }, {
    key: "merge0",
    value: function merge0(data) {
      if (this._status === 'locked' || this._status === 'loading') {
        this.methodErrLog('merge0', [data], 'locked/loading', "can't set merge0 when '".concat(this._name, "' is locked or loading."));
        return;
      }

      var value = Object.assign({}, this.first(), data);

      if (this.isEmpty()) {
        this.set(value);
      } else {
        this._value[0] = value;
        this.set(this._value);
        ;
      }
    }
  }, {
    key: "first",
    value: function first() {
      var defaultValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.getValue('0', defaultValue);
    }
  }, {
    key: "getValue",
    value: function getValue(path, defaultValue) {
      return (0, _Utils.getDeepValue)(this._value, path, defaultValue);
    }
  }, {
    key: "hasData",
    value: function hasData() {
      return this.getStatus() !== 'undefined';
    }
  }, {
    key: "get",
    value: function get() {
      return this._value;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this._status === 'undefined') {
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.methodErrLog('clear', [], 'locked/loading', "can't clear when '".concat(this._name, "' is locked or loading."));
        return;
      }

      this.set([]);
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.getCount() === 0;
    }
  }, {
    key: "getCount",
    value: function getCount() {
      return this._value.length;
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return this._status;
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this._eternal) {
        this.methodErrLog('remove', [], 'eternal', "can't remove eternal dataStore '".concat(this._name, "'."));
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.methodErrLog('remove', [], 'locked/loading', "can't remove when '".concat(this._name, "' is locked or loading."));
        return;
      }

      this._value = [];
      this._oldStatus = 'undefined';

      this._setStatus('undefined');

      this._emitDataChange();
    }
  }, {
    key: "isLocked",
    value: function isLocked() {
      return this._status === 'locked';
    }
  }, {
    key: "isLoading",
    value: function isLoading() {
      return this._status === 'loading';
    }
  }, {
    key: "setErrorMsg",
    value: function setErrorMsg(msg) {
      if ((0, _Utils.isNvl)(msg)) {
        this.methodErrLog('setErrorMsg', [msg], 'null', "can't set null error message to '".concat(this._name, "'."));
        return;
      }

      this._errMsg = msg;

      this._setStatus('error');
    }
  }, {
    key: "getErrorMsg",
    value: function getErrorMsg() {
      return this._errMsg;
    }
  }, {
    key: "lock",
    value: function lock() {
      if (this._status === 'loading') {
        this.methodErrLog('lock', [], 'loading', "can't lock  when '".concat(this._name, "' is loading."));
        return;
      }

      this._lockStack++;

      this._setStatus('locked');
    }
  }, {
    key: "unLock",
    value: function unLock() {
      if (this._lockStack > 0) {
        this._lockStack--;
      }

      this.devLog("unLock: lockStack=".concat(this._lockStack, ", oldStatus=").concat(this._oldStatus));

      if (this._lockStack === 0) {
        this._setStatus(this._oldStatus);
      }
    }
  }, {
    key: "unLockAll",
    value: function unLockAll() {
      this._lockStack = 0;
      this.unLock();
    }
  }, {
    key: "loading",
    value: function loading() {
      this.devLog("loading: status=".concat(this._status));

      if (this._status === 'locked' || this._status === 'loading') {
        this.methodErrLog('loading', [], 'locked/loading', "can't set status=loading when '".concat(this._name, "' is locked or loading."));
        return;
      }

      this._setStatus('loading');
    }
  }, {
    key: "clearLoading",
    value: function clearLoading() {
      if (this._status === 'loading') {
        this._setStatus(this._oldStatus);
      }
    }
  }, {
    key: "loaded",
    value: function loaded(value) {
      if (this._status !== 'loading') {
        this.methodErrLog('loaded', [value], 'locked/loading', "'".concat(this._name, "' isn't loading."));
        return;
      }

      if (this._status === 'locked') {
        this.methodErrLog('loaded', [value], 'locked/loading', "can't set status=".concat(this._oldStatus, " when '").concat(this._name, "' is locked."));
        return;
      }

      this.clearLoading();
      this.set(value);
    }
  }]);

  return DataStore;
}(_Component2.default), (_applyDecoratedDescriptor(_class.prototype, "getPageInfo", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPageInfo"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setConfig", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setConfig"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getExtendConfig", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getExtendConfig"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getStoreConfig", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getStoreConfig"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "set", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "set"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "merge0", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "merge0"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "first", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "first"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getValue", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getValue"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "hasData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasData"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "get", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "get"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "clear", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "clear"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isEmpty", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isEmpty"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getCount", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getCount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getStatus", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getStatus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "remove", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "remove"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLocked", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLocked"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setErrorMsg", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setErrorMsg"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getErrorMsg", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getErrorMsg"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "lock", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "lock"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unLock", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unLock"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unLockAll", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unLockAll"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "loading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "loading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "clearLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "clearLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "loaded", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "loaded"), _class.prototype)), _class);
exports.default = DataStore;
DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;