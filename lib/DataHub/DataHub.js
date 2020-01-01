"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

var _DataStore = _interopRequireDefault(require("./DataStore"));

var _Controller = _interopRequireDefault(require("./Controller"));

var _Component2 = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethod = _Component2.default.publicMethod;
var DataHub = (_class =
/*#__PURE__*/
function (_Component) {
  _inherits(DataHub, _Component);

  function DataHub(cfg) {
    var devLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
    var errLog = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _Utils.udFun;

    var _devMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, DataHub);

    return _possibleConstructorReturn(this, _getPrototypeOf(DataHub).call(this, {
      devLog: devLog,
      errLog: errLog
    }, cfg, _devMode));
  }

  _createClass(DataHub, [{
    key: "afterCreate",
    value: function afterCreate(dh, cfg) {
      this._cfg = cfg || {};
      this._dh = this;
      this._emitter = new _Emitter.default(this.devLog, this.errLog, this._devMode);
      this._dhc = new _Controller.default(this, this._devMode);
      this._dataCenter = {};
      this._extendConfig = {};

      this._initDsPublicMethods();

      this._init();
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      Object.values(this._dataCenter).forEach(function (ds) {
        return ds.destroy();
      });
      this._dataCenter = null;

      this._dhc.destroy();

      this._dhc = null;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _emitter = this._emitter;

      _get(_getPrototypeOf(DataHub.prototype), "destroy", this).call(this);

      _emitter.destroy();
    }
  }, {
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
  }]);

  return DataHub;
}(_Component2.default), (_applyDecoratedDescriptor(_class.prototype, "getDataStore", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getDataStore"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getController"), _class.prototype)), _class);
exports.default = DataHub;
var globalDataHub = new DataHub({}, _Utils.udFun, _Utils.udFun, false);
var globalMethods = globalDataHub.getController();
DataHub.globalDataHub = globalDataHub;
Object.keys(globalMethods).forEach(function (method) {
  DataHub[method] = function () {
    return globalMethods[method].apply(globalMethods, arguments);
  };
});