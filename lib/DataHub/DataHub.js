"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

var _DataStore = _interopRequireDefault(require("./DataStore"));

var _Controller = _interopRequireDefault(require("./Controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DataHub =
/*#__PURE__*/
function () {
  function DataHub(cfg) {
    var _this = this;

    var devLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
    var errLog = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _Utils.udFun;

    var _devMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, DataHub);

    this._key = (0, _Utils.getUniIndex)();
    this._clazz = this.constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    this._cfg = cfg;
    this._devMode = _devMode;
    this._dataCenter = {};
    this._extendConfig = {};
    this._emitter = new _Emitter.default(this.devLog, this.errLog, _devMode);
    this._dh = this;
    this._dhc = new _Controller.default(this);

    this._emitter.once("$$destroy:Emitter=".concat(this._emitter._key), function () {
      _this.devLog && _this.devLog("Emitter destroyed => DataHub destroy .");

      _this.destroy();
    });

    this._emitter.once("$$destroy:Controller=".concat(this._dhc._key), function () {
      _this.devLog && _this.devLog("Controller destroyed => DataHub destroy .");

      _this.destroy();
    });

    this.devLog = _devMode ? devLog.createLog(this._logName) : _Utils.udFun;
    this.errLog = errLog.createLog(this._logName);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('DataHub', this._key);

    this._initDsPublicMethods();

    this._init();

    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(DataHub, [{
    key: "_init",
    value: function _init() {
      for (var name in this._cfg) {
        if (/\_|\$/g.test(name.charAt(0))) {
          this._extendConfig[name] = this._cfg[name];
          continue;
        }

        this.getDataStore(name).setConfig(this._cfg[name]);
      }
    }
  }, {
    key: "_initDsPublicMethods",
    value: function _initDsPublicMethods() {
      var _this2 = this;

      _DataStore.default.publicMethods.forEach(function (methodName) {
        _this2[methodName] = function (name) {
          var _this2$getDataStore;

          if (_this2._destroyed) {
            _this2.destroyedErrorLog(methodName);

            return _Utils.udFun;
          }

          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return (_this2$getDataStore = _this2.getDataStore(name))[methodName].apply(_this2$getDataStore, args);
        };
      });
    }
  }, {
    key: "getDataStore",
    value: function getDataStore(name) {
      if (!this._dataCenter[name]) {
        this._dataCenter[name] = new _DataStore.default(this, name, this.devLog, this.errLog, this._devMode);
      }

      return this._dataCenter[name];
    }
  }, {
    key: "getController",
    value: function getController() {
      if (this._destroyed) {
        this.destroyedErrorLog('getController');
        return _Utils.udFun;
      }

      return this._dhc.getPublicMethods();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key);

      this._emitter.emit("$$destroy:".concat(this._clazz, "=").concat(this._key));

      Object.values(this._dataCenter).forEach(function (ds) {
        return ds.destroy();
      });
      this._dataCenter = null;

      this._dhc.destroy();

      this._dhc = null;

      this._emitter.destroy();

      this._emitter = null;
      this._destroyed = true;
      this._dh = null;
      this._key = null;
    }
  }]);

  return DataHub;
}();

exports.default = DataHub;