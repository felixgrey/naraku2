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

var _class, _temp;

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
var ViewModel = (_class = (_temp =
/*#__PURE__*/
function (_LifeCycle) {
  _inherits(ViewModel, _LifeCycle);

  function ViewModel() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, ViewModel);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(ViewModel)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this._momentMethods = ['getContextDataHub', 'getMyDataHub', 'destroyHandle', 'fromParent', 'onChange', 'turnOn', 'turnOff'];
    return _this;
  }

  _createClass(ViewModel, [{
    key: "_initialization",
    value: function _initialization() {
      var _this2 = this;

      var viewKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this._viewKey = viewKey;
      this._props = props;
      this._parentKey = null;
      this._viewContext = null;
      this._changeHandle = _Utils.udFun;
      this._moment = null;
      this._unmoment = _Utils.udFun;
      this._name = (0, _Utils.isNvl)(props.MyName) ? null : props.MyName;
      this._withStore = props.withStore || null;
      this._gdhc = _DataHub.default.createController();

      this._gdhc.watch(function () {
        _this2._changeHandle();
      });
    }
  }, {
    key: "getContextDataHub",
    value: function getContextDataHub() {
      return this._viewContext;
    }
  }, {
    key: "setMyDataHub",
    value: function setMyDataHub(cfgOrDh) {
      var _this3 = this;

      if ((0, _Utils.isNvl)(cfgOrDh)) {
        return;
      }

      if (this._dh) {
        this.errLog("dh existed.");
        return;
      }

      if (cfgOrDh instanceof _DataHub.default) {
        this._dh = cfgOrDh;
      } else {
        this._dh = new _DataHub.default(cfgOrDh, this.devLog, this.errLog, this._devMode);
      }

      this._dh.getController().watch(function () {
        if (_this3._gdhc.isWillRefresh()) {
          return;
        }

        if (_this3._viewContext && _this3._viewContext.isWillRefresh()) {
          return;
        }

        _this3._changeHandle();
      });
    }
  }, {
    key: "getParentChain",
    value: function getParentChain() {
      if (!this._viewContext) {
        return [];
      }

      return this._viewContext._tree.getParentChain(this._viewKey);
    }
  }, {
    key: "getMyDataHub",
    value: function getMyDataHub() {
      return this._dh;
    }
  }, {
    key: "turnOn",
    value: function turnOn(storeName) {
      if (!this._viewContext) {
        return;
      }

      this._viewContext.getController().turnOn(storeName);
    }
  }, {
    key: "turnOff",
    value: function turnOff(storeName) {
      if (!this._viewContext) {
        return;
      }

      this._viewContext.getController().turnOff(storeName);
    }
  }, {
    key: "createHandle",
    value: function createHandle(moment) {
      var _this4 = this;

      var preText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (this._destroyed) {
        return;
      }

      var format = _Utils.sameFun;

      if (preText.charAt(preText.length - 1) === '_') {
        format = function format(method) {
          return (0, _Utils.toUnderline)(preText + method);
        };
      } else if (preText.length) {
        format = function format(method) {
          return (0, _Utils.toCamel)(preText + '_' + method);
        };
      }

      this._momentMethods.forEach(function (method) {
        moment[format(method)] = function () {
          return _this4[method].apply(_this4, arguments);
        };
      });

      moment[format('viewModel')] = this;
      this._moment = moment;

      this._unmoment = function () {
        _this4._momentMethods.forEach(function (method) {
          moment[format(method)] = null;
        });

        moment[format('viewModel')] = null;
        _this4._moment = null;
      };
    }
  }, {
    key: "destroyHandle",
    value: function destroyHandle() {
      if (this._destroyed) {
        return;
      }

      this._viewContext && this._viewContext.removeNode(this._viewKey);
      this.destroy();
    }
  }, {
    key: "onChange",
    value: function onChange() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

      if (this._destroyed) {
        return;
      }

      this._changeHandle = callback;
    }
  }, {
    key: "fromParent",
    value: function fromParent(key, viewContext) {
      var _this5 = this;

      if (this._destroyed || (0, _Utils.isNvl)(key) || (0, _Utils.isNvl)(viewContext)) {
        return;
      }

      this._parentKey = key;
      this._viewContext = viewContext;
      viewContext.createNode(this._viewKey, this);
      viewContext.watch(function () {
        if (_DataHub.default.isWillRefresh()) {
          return;
        }

        _this5._changeHandle();
      });
    }
  }, {
    key: "_destruction",
    value: function _destruction() {
      this._dh && this._dh.destroy();
      this._dh = null;

      this._gdhc.destroy();

      this._gdhc = null;
      this._viewContext = null;
      this._view = null;

      this._unmoment();

      this._props = null;
    }
  }]);

  return ViewModel;
}(_LifeCycle2.default), _temp), (_applyDecoratedDescriptor(_class.prototype, "getContextDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getContextDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getMyDataHub", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getMyDataHub"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOn", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOn"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOff", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOff"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createHandle", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createHandle"), _class.prototype)), _class);
exports.default = ViewModel;
ViewModel.$loggerByParam = true;