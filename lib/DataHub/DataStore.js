"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['set', 'merge0', 'first', 'getValue', 'get', 'clear', 'isEmpty', 'getCount', 'getStatus', 'remove', 'isLocked', 'isLoading', 'setErrorMsg', 'getErrorMsg', 'lock', 'unLock', 'loading', 'clearLoading', 'loaded'];
var allStatus = ['undefined', 'ready', 'loading', 'locked', 'error'];

var DataStore =
/*#__PURE__*/
function () {
  function DataStore(dh, name) {
    var _this = this;

    var eternal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _devMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, DataStore);

    this._key = (0, _Utils.getUniIndex)();
    this._name = name;
    this._eternal = eternal;
    this._destroyed = false;
    this._dh = dh;
    this._emitter = dh._emitter;
    this._value = [];
    this._storeConfig = {};
    this._oldStatus = 'undefined';
    this._status = 'undefined';
    this._lockStack = 0;
    this._errMsg = null;

    dh._emitter.once('$$destroy:DataHub', function () {
      _this.destroy();
    });

    this.devLog = _devMode ? this._dh.devLog.createLog('DataStore:' + name) : udFun;
    this.errLog = this._dh.errLog.createLog('DataStore:' + name);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('DataStore', name);
    this.devLog("DataStore=".concat(this._key, " created."));
  }

  _createClass(DataStore, [{
    key: "setEternal",
    value: function setEternal(flag) {
      this._eternal = flag;
    }
  }, {
    key: "setConfig",
    value: function setConfig(cfg) {
      this._storeConfig = cfg;
    }
  }, {
    key: "getStoreConfig",
    value: function getStoreConfig() {
      return this._storeConfig;
    }
  }, {
    key: "_setStatus",
    value: function _setStatus(status) {
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

      this._emitDataChange();

      this._setStatus('ready');
    }
  }, {
    key: "merge0",
    value: function merge0(data) {
      var value = Object.assign({}, this.first(), data);

      if (this.isEmpty()) {
        this.set(value);
      } else {
        this._value[0] = value;

        this._emitDataChange();
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
        this.errLog("can't clear when '".concat(this._name, "' is locked or loading."));
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
        this.errLog("can't remove eternal dataStore '".concat(this._name, "'."));
        return;
      }

      if (this._status === 'locked' || this._status === 'loading') {
        this.errLog("can't remove when '".concat(this._name, "' is locked or loading."));
        return;
      }

      this._value = [];
      this._oldStatus = 'undefined';

      this._emitDataChange();

      this._setStatus('undefined');
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
        this.errLog("can't set null error message to '".concat(this._name, "'."));
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
        this.errLog("can't set status=loading when '".concat(this._name, "' is locked or loading."));
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

      this.devLog("DataStore=".concat(this._key, " destroy"));

      this._emitter.emit('$$destroy:DataStore', this._key);

      this._emitter.emit("$$destroy:DataStore:".concat(this._key));

      this._destroyed = true;
      this._value = null;
      this._storeConfig = null;
      this._dh = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return DataStore;
}();

exports.default = DataStore;
DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;