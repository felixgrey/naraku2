"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _LifeCycle2 = _interopRequireDefault(require("./../Common/LifeCycle"));

var _DataHub = _interopRequireDefault(require("./../DataHub/DataHub"));

var _Controller = _interopRequireDefault(require("./../DataHub/Controller"));

var _ViewContext = _interopRequireDefault(require("./ViewContext"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var publicMethod = _LifeCycle2.default.publicMethod;
var ViewModel = (_class =
/*#__PURE__*/
function (_LifeCycle) {
  _inherits(ViewModel, _LifeCycle);

  function ViewModel() {
    _classCallCheck(this, ViewModel);

    return _possibleConstructorReturn(this, _getPrototypeOf(ViewModel).apply(this, arguments));
  }

  _createClass(ViewModel, [{
    key: "_initialization",
    value: function _initialization() {
      var _this = this;

      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var dhOrCfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this._showLog = false;
      this._config = config;
      this._parentKey = null;
      this._viewContext = null;
      this._changeHandle = _Utils.udFun;
      this._withStore = config.withStore || null;

      if (dhOrCfg instanceof _DataHub.default) {
        this._dh = dhOrCfg;
      } else {
        this._dh = new _DataHub.default(dhOrCfg, this.devLog, this.errLog, this._devMode);
      }

      this._dh.getController().watch(function () {
        if (_DataHub.default.isWillRefresh()) {
          return;
        }

        if (_this._viewContext && _this._viewContext.isWillRefresh()) {
          return;
        }

        _this._changeHandle();
      });
    }
  }, {
    key: "getContextDataHub",
    value: function getContextDataHub() {
      return this._viewContext;
    }
  }, {
    key: "getMyDataHub",
    value: function getMyDataHub() {
      return this._dh;
    }
  }, {
    key: "showDevLog",
    value: function showDevLog(flag) {
      this._showLog = flag;
    }
  }, {
    key: "getLifeCycleMethods",
    value: function getLifeCycleMethods() {
      var _this2 = this;

      return {
        viewKey: this._key,
        createHandle: function createHandle(moment) {
          if (_this2._destroyed) {
            return;
          }

          moment.getContextDataHub = function () {
            return _this2.getContextDataHub();
          };

          moment.getMyDataHub = function () {
            return _this2.getMyDataHub();
          };

          moment.showDevLog = function (flag) {
            return _this2.showDevLog(flag);
          };
        },
        destroyHandler: function destroyHandler() {
          if (_this2._destroyed) {
            return;
          }

          _this2._viewContext && _this2._viewContext.removeNode(_this2._viewKey);

          _this2.destroy();
        },
        onChange: function onChange() {
          var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

          if (_this2._destroyed) {
            return;
          }

          _this2._changeHandle = callback;
        },
        getMyDhController: function getMyDhController() {
          if (_this2._destroyed) {
            return _Utils.udFun;
          }

          return _this2._dh.getController();
        },
        getModelInfo: function getModelInfo() {
          if (_this2._destroyed || !_this2._withStore || !_this2._viewContext) {
            return {};
          }

          var _this2$_viewContext$g = _this2._viewContext.getController(),
              get = _this2$_viewContext$g.get,
              getStatus = _this2$_viewContext$g.getStatus;

          return {
            data: get(_this2._withStore),
            status: getStatus(_this2._withStore)
          };
        },
        fromParent: function fromParent(key, viewContext) {
          if (_this2._destroyed) {
            return;
          }

          _this2._parentKey = key;
          _this2._viewContext = viewContext;
          viewContext.createNode(_this2._viewKey, _this2);
          viewContext.watch(function () {
            if (_DataHub.default.isWillRefresh()) {
              return;
            }

            _this2._changeHandle();
          });
        }
      };
    }
  }, {
    key: "_destruction",
    value: function _destruction() {
      this._dh && this._dh.destroy();
      this._dh = null;
      this._viewContext = null;
      this._view = null;
    }
  }]);

  return ViewModel;
}(_LifeCycle2.default), (_applyDecoratedDescriptor(_class.prototype, "getContextDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getContextDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "showDevLog", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "showDevLog"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getLifeCycleMethods", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getLifeCycleMethods"), _class.prototype)), _class);
exports.default = ViewModel;
ViewModel.$loggerByParam = false;
ViewModel.createMainView = _Utils.udFun;
ViewModel.createSubView = _Utils.udFun;