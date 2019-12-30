"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component = _interopRequireDefault(require("./Component"));

var _PaginationManager = _interopRequireDefault(require("./PaginationManager.js"));

var _RelationManager = _interopRequireDefault(require("./RelationManager.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['set', 'merge0', 'first', 'getValue', 'get', 'clear', 'isEmpty', 'getCount', 'getStatus', 'remove', 'setErrorMsg', 'getErrorMsg', 'lock', 'unLock', 'loading', 'clearLoading', 'loaded'];
var allStatus = ['undefined', 'ready', 'loading', 'locked', 'error'];

var DataStore =
/*#__PURE__*/
function () {
  function DataStore(dh, name) {
    var _this = this;

    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, DataStore);

    this._key = (0, _Utils.getUniIndex)();
    this._name = name;
    this._eternal = false;
    this._destroyed = false;
    this._dh = dh;
    this._dhc = dh._dhc;
    this._emitter = dh._emitter;
    this._value = [];
    this._storeConfig = null;
    this._extendConfig = {};
    this._oldStatus = 'undefined';
    this._status = 'undefined';
    this._lockStack = 0;
    this._errMsg = null;
    var logName = "DataStore=".concat(this._key, "@").concat(name);
    this.devLog = _devMode ? this._dh.devLog.createLog(logName) : udFun;
    this.errLog = this._dh.errLog.createLog(logName);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('DataStore', this._key);
    this._pagination = new _PaginationManager.default(this, _devMode);
    this._relationManager = new _RelationManager.default(this, _devMode);

    this._emitter.once("$$destroy:".concat(dh._clazz, ":").concat(dh._key), function () {
      _this.devLog && _this.devLog("".concat(dh._clazz, " destroyed => ").concat(_this._clazz, " destroy ."));

      _this.destroy();
    });

    _RelationManager.default.publicMethods.forEach(function (method) {
      _this[method] = function () {
        var _this$_relationManage;

        if (_this._hasErr(method)) {
          return udFun;
        }

        return (_this$_relationManage = _this._relationManager)[method].apply(_this$_relationManage, arguments);
      };
    });

    this.devLog("DataStore=".concat(this._key, " created."));
  }

  _createClass(DataStore, [{
    key: "_hasErr",
    value: function _hasErr(name) {
      if (this._destroyed) {
        this.devLog("run '".concat(name, "' failed : "), this._destroyed);
        return true;
      }

      return false;
    }
  }, {
    key: "getPaginationManager",
    value: function getPaginationManager() {
      if (this._hasErr()) {
        return;
      }

      return this._pagination;
    }
  }, {
    key: "setConfig",
    value: function setConfig(cfg) {
      var _this2 = this;

      if (this._hasErr()) {
        return;
      }

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
          _this2._extendConfig = value;
          _this2._dh._extendConfig[name] = value;
          return;
        }
      });

      this._relationManager.init(cfg);

      this._pagination.init(cfg.pagination);

      this._storeConfig = cfg;
    }
  }, {
    key: "getStoreConfig",
    value: function getStoreConfig() {
      if (this._hasErr()) {
        return {};
      }

      return this._storeConfig || {};
    }
  }, {
    key: "_setStatus",
    value: function _setStatus(status) {
      if (this._hasErr()) {
        return;
      }

      if (status === this._status) {
        return;
      }

      this.devLog("changeStatus :".concat(this._status, " => ").concat(status));
      this._oldStatus = this._status;
      this._status = status;

      this._emitter.emit('$$status', {
        name: this._name,
        value: this._status
      });

      this._emitter.emit("$$status:".concat(this._name, ":").concat(this._status));
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
      if (this._hasErr()) {
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.errLog("can't set value when '".concat(this._name, "' is locked or loading."));
        return;
      }

      if (value === undefined) {
        value = [];
      }

      value = [].concat(value);
      this._value = value;
      this._errMsg = null;
      this.devLog("run set", value);

      this._setStatus('ready');

      this._emitDataChange();
    }
  }, {
    key: "merge0",
    value: function merge0(data) {
      if (this._hasErr()) {
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.errLog("can't set merge0 when '".concat(this._name, "' is locked or loading."));
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

      if (this._hasErr()) {
        return defaultValue;
      }

      return this.getValue('0', defaultValue);
    }
  }, {
    key: "getValue",
    value: function getValue(path, defaultValue) {
      if (this._hasErr()) {
        return false;
      }

      return (0, _Utils.getDeepValue)(this._value, path, defaultValue);
    }
  }, {
    key: "hasData",
    value: function hasData() {
      if (this._hasErr()) {
        return false;
      }

      return this.getStatus() !== 'undefined';
    }
  }, {
    key: "get",
    value: function get() {
      if (this._hasErr()) {
        return [];
      }

      return this._value;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this._hasErr()) {
        return;
      }

      if (this._status === 'undefined') {
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.errLog("can't clear when '".concat(this._name, "' is locked or loading."));
        return;
      }

      this.set([]);
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      if (this._hasErr()) {
        return false;
      }

      return this.getCount() === 0;
    }
  }, {
    key: "getCount",
    value: function getCount() {
      if (this._hasErr()) {
        return 0;
      }

      return this._value.length;
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      if (this._hasErr()) {
        return 'undefined';
      }

      return this._status;
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this._hasErr()) {
        return;
      }

      if (this._eternal) {
        this.errLog("can't remove eternal dataStore '".concat(this._name, "'."));
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.errLog("can't remove when '".concat(this._name, "' is locked or loading."));
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
      if (this._hasErr()) {
        return false;
      }

      return this._status === 'locked';
    }
  }, {
    key: "isLoading",
    value: function isLoading() {
      if (this._hasErr()) {
        return false;
      }

      return this._status === 'loading';
    }
  }, {
    key: "setErrorMsg",
    value: function setErrorMsg(msg) {
      if (this._hasErr()) {
        return false;
      }

      if ((0, _Utils.isNvl)(msg)) {
        this.errLog("can't set null error message to '".concat(this._name, "'."));
        return;
      }

      this._errMsg = msg;

      this._setStatus('error');
    }
  }, {
    key: "getErrorMsg",
    value: function getErrorMsg() {
      if (this._hasErr()) {
        return null;
      }

      return this._errMsg;
    }
  }, {
    key: "lock",
    value: function lock() {
      if (this._hasErr()) {
        return;
      }

      this._lockStack++;

      this._setStatus('locked');
    }
  }, {
    key: "unLock",
    value: function unLock() {
      if (this._hasErr()) {
        return;
      }

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
      if (this._hasErr()) {
        return;
      }

      this._lockStack = 0;
      this.unLock();
    }
  }, {
    key: "loading",
    value: function loading() {
      if (this._hasErr()) {
        return;
      }

      this.devLog("loading: status=".concat(this._status));

      if (this._status === 'locked' || this._status === 'loading') {
        this.errLog("can't set status=loading when '".concat(this._name, "' is locked or loading."));
        return;
      }

      this._setStatus('loading');
    }
  }, {
    key: "clearLoading",
    value: function clearLoading() {
      if (this._hasErr()) {
        return;
      }

      if (this._status === 'loading') {
        this._setStatus(this._oldStatus);
      }
    }
  }, {
    key: "loaded",
    value: function loaded(value) {
      if (this._hasErr()) {
        return;
      }

      if (this._status !== 'loading') {
        this.errLog("'".concat(this._name, "' isn't loading."));
        return;
      }

      if (this._status === 'locked') {
        this.errLog("can't set status=".concat(this._oldStatus, " when '").concat(this._name, "' is locked."));
        return;
      }

      this.clearLoading();
      this.set(value);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("DataStore=".concat(this._key, " destroy."));

      this._emitter.emit('$$destroy:DataStore', this._key, this._name);

      this._emitter.emit("$$destroy:DataStore@".concat(this._name), this._key);

      this._emitter.emit("$$destroy:DataStore=".concat(this._key), this._name);

      this._pagination.destroy();

      this._pagination = null;

      this._relationManager.destroy();

      this._relationManager = null;
      this._destroyed = true;
      this._value = null;
      this._storeConfig = null;
      this._extendConfig = null;
      this._dh = null;
      this._dhc = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._name = null;
      this._key = null;
    }
  }]);

  return DataStore;
}();

exports.default = DataStore;
DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;