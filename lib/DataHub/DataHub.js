"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.dataOpMethods = void 0;

var _Utils = require("./Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

var _Controller = _interopRequireDefault(require("./Controller"));

var _ConfigManager = _interopRequireDefault(require("./ConfigManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var statusList = ['undefined', 'loading', 'locked', 'set', 'error'];
var dataOpMethods = ['set', 'get', 'remove', 'hasData', 'setStatus', 'getStatus', 'lock', 'unLock'];
exports.dataOpMethods = dataOpMethods;

var DataHub =
/*#__PURE__*/
function () {
  function DataHub(config) {
    var devLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
    var errLog = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _Utils.udFun;

    _classCallCheck(this, DataHub);

    this._key = (0, _Utils.getUniIndex)();
    this._config = config;
    this.devLog = devLog;
    this.errLog = errLog; // Emitter -> Controller -> 其它

    this._emitter = new _Emitter.default();
    this._controller = new _Controller.default(this);
    this._configManager = new _ConfigManager.default(this);
    this._destroyed = false;
    this._data = {};
    this._status = {};
    this._lockStack = {};
    this.extendData = {};
  }

  _createClass(DataHub, [{
    key: "_initLockStack",
    value: function _initLockStack(name) {
      this._lockStack[name] = this._lockStack[name] || {
        old: null,
        stack: 0
      };
    }
  }, {
    key: "_isLocked",
    value: function _isLocked(name) {
      return this._lockStack[name].stack > 0;
    }
  }, {
    key: "hasData",
    value: function hasData(name) {
      return this._data[name] !== undefined;
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      if (this._status[name] === 'loading') {
        this.errLog("can't set ".concat(name, " when it is loading"));
        return;
      }

      if (this._isLocked(name)) {
        this.errLog("can't set ".concat(name, " when it is locked"));
        return;
      }

      if (value === undefined) {
        value = [];
      }

      value = [].concat(value);
      this._data[name] = value;

      this._emitter.emit('$$data', {
        name: name,
        value: value
      });

      this.setStatus(name, 'set');
    }
  }, {
    key: "get",
    value: function get(name) {
      if ((0, _Utils.isNvl)(name)) {
        return [];
      }

      return this._data[name] || [];
    }
  }, {
    key: "remove",
    value: function remove(name) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      if (this._isLocked(name)) {
        this.errLog("can't remove ".concat(name, " when it is locked."));
        return;
      }

      delete this._data[name];
      delete this._status[name];
      delete this._lockStack[name];

      this._emitter.emit('$$data', {
        name: name,
        value: undefined
      });

      this._emitter.emit('$$status', {
        name: name,
        value: 'undefined'
      });

      this._emitter.emit('$$remove:' + name);
    }
  }, {
    key: "lock",
    value: function lock(name) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      if (!this.hasData(name)) {
        return;
      }

      this._initLockStack(name);

      var oldStatus = this.getStatus(name);

      if (oldStatus !== 'locked') {
        this._lockStack[name].old = oldStatus;
        this._status[name] = 'locked';

        this._emitter.emit('$$status', {
          name: name,
          value: 'locked'
        });
      }

      this._lockStack[name].stack++;
    }
  }, {
    key: "unLock",
    value: function unLock(name) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      if (!this.hasData(name)) {
        return;
      }

      if (!this._isLocked(name)) {
        return;
      }

      this._lockStack[name]--;

      if (!this._lockStack[name].stack) {
        this._status[name] = this._lockStack[name].old;
        this._lockStack[name].old = null;

        this._emitter.emit('$$status', {
          name: name,
          value: this._status[name]
        });
      }
    }
  }, {
    key: "setStatus",
    value: function setStatus(name, value) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      if (!this.hasData(name)) {
        return;
      }

      this._lockStack[name] = this._lockStack[name] || {
        old: null,
        stack: 0
      };

      if (this._lockStack[name].stack) {
        this.errLog("can't set status ".concat(name, "=").concat(value, " when it is locked."));
        return;
      }

      if (statusList.indexOf(value) === -1) {
        this.errLog("".concat(name, " status must be one of ").concat(statusList.join(','), ", but it is ").concat(value));
        return;
      }

      if (this.getStatus(name) !== value) {
        this._status[name] = value;

        this._emitter.emit('$$status', {
          name: name,
          value: value
        });
      }
    }
  }, {
    key: "getStatus",
    value: function getStatus(name) {
      if ((0, _Utils.isNvl)(name)) {
        return 'undefined';
      }

      return this._status[name] || 'undefined';
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this._controller.destroy();

      this._emitter.emit('$$destroy:dataHub', this._key);

      this._configManager.destroy();

      this._emitter.destroy();

      this._destroyed = true;
      this._controller = null;
      this._emitter = null;
      this._config = null;
      this._data = null;
      this._status = null;
      this._lockStack = null;
      this._key = null;
      this.extendData = null;
    }
  }]);

  return DataHub;
}();

exports.default = DataHub;