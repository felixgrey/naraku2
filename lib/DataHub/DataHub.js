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
    var devLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
    var errLog = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _Utils.udFun;

    var _devMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, DataHub);

    this._key = (0, _Utils.getUniIndex)();
    this._cfg = cfg;
    this._destroyed = false;
    this._devMode = _devMode;
    this._dataCenter = {};
    this._paginationData = {};
    this._emitter = new _Emitter.default(this.devLog, this.errLog, _devMode);

    this._initDsPublicMethods();

    this._controller = new _Controller.default(this); // ConfigManager

    this.devLog = _devMode ? devLog.createLog("DataHub=".concat(this._key)) : _Utils.udFun;
    this.errLog = errLog.createLog("DataHub=".concat(this._key));
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('DataHub', this._key);
    this.devLog("DataHub=".concat(this._key, " created."));
  }

  _createClass(DataHub, [{
    key: "_initDsPublicMethods",
    value: function _initDsPublicMethods() {
      var _this = this;

      _DataStore.default.publicMethods.forEach(function (methodName) {
        _this[methodName] = function (name) {
          var _this$getDataStore;

          if (_this._destroyed) {
            _this.destroyedErrorLog(methodName);

            return _Utils.udFun;
          }

          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return (_this$getDataStore = _this.getDataStore(name))[methodName].apply(_this$getDataStore, args);
        };
      });
    }
  }, {
    key: "getPaginationManager",
    value: function getPaginationManager(name) {
      if (!this._paginationData[name]) {
        this._paginationData[name] = new PaginationManager(this, name, this.devLog, this.errLog, this._devMode);
      }

      return this._paginationData[name];
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

      return this._controller.getPublicMethods();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("DataHub=".concat(this._key, " destroyed."));

      this._emitter.emit('$$destroy:DataHub', this._key);

      this._emitter.emit("$$destroy:DataHub:".concat(this._key)); // ConfigManager


      this._controller.destroy();

      this._controller = null;
      Object.values(this._dataCenter).forEach(function (ds) {
        return ds.destroy();
      });
      this._dataCenter = null;

      this._emitter.destroy();

      this._emitter = null;
      this._destroyed = true;
      this._key = null;
    }
  }]);

  return DataHub;
}();

exports.default = DataHub;