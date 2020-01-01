"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

var _LifeCycle2 = _interopRequireDefault(require("./../Common/LifeCycle"));

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

var Component =
/*#__PURE__*/
function (_LifeCycle) {
  _inherits(Component, _LifeCycle);

  function Component() {
    _classCallCheck(this, Component);

    return _possibleConstructorReturn(this, _getPrototypeOf(Component).apply(this, arguments));
  }

  _createClass(Component, [{
    key: "_initialization",
    value: function _initialization(container) {
      var _this = this;

      if (_typeof(container) !== 'object') {
        container = {
          _key: '???',
          _clazz: '???'
        };
      }

      this._dhc = container._dhc || null;
      this._dh = container._dh || null;
      this._store = container._store || null;
      this._emitter = container._emitter || _Utils.udFun;
      this.devLog = container.devLog || _Utils.udFun;
      this.errLog = container.errLog || _Utils.udFun;

      this._emitter.once("$$destroy:".concat(container._clazz, "=").concat(container._key), function () {
        _this.devLog("".concat(container._clazz, "=").concat(container._key, " destroyed => ").concat(_this._logName, " destroyed ."));

        _this.destroy();
      });

      if (_Utils.createLog.showPublicMethods) {
        this.devLog("publicMethods of ".concat(this._clazz), this.constructor.prototype._publicMethods);
      }
    }
  }, {
    key: "_destruction",
    value: function _destruction() {
      this._dh = null;
      this._dhc = null;
      this._store = null;
    }
  }]);

  return Component;
}(_LifeCycle2.default);

exports.default = Component;
Component.publicMethod = _LifeCycle2.default.publicMethod;