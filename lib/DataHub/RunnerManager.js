"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component2 = _interopRequireDefault(require("./Component"));

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

var publicMethods = ['hasRunner', 'unRegister', 'register', 'run'];
var publicMethod = _Component2.default.publicMethod;
var RunnerManager = (_class =
/*#__PURE__*/
function (_Component) {
  _inherits(RunnerManager, _Component);

  function RunnerManager() {
    _classCallCheck(this, RunnerManager);

    return _possibleConstructorReturn(this, _getPrototypeOf(RunnerManager).apply(this, arguments));
  }

  _createClass(RunnerManager, [{
    key: "afterCreate",
    value: function afterCreate() {
      this._runner = {};
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      this._runner = null;
    }
  }, {
    key: "hasRunner",
    value: function hasRunner(name) {
      if ((0, _Utils.isNvl)(name)) {
        return false;
      }

      return !!this._runner[name];
    }
  }, {
    key: "unRegister",
    value: function unRegister(name) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      delete this._runner[name];
    }
  }, {
    key: "register",
    value: function register(name, callback) {
      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      if (this._runner[name]) {
        this.errLog("runner ".concat(name, " has existed."));
        return;
      }

      this._runner[name] = callback;
    }
  }, {
    key: "run",
    value: function run(name) {
      var _this$_runner;

      if ((0, _Utils.isNvl)(name)) {
        return _Utils.udFun;
      }

      if (!this._runner[name]) {
        this.errLog("runner ".concat(name, " not existed."));
        return _Utils.udFun;
      }

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this._emitter.emit('$$run', {
        controller: this._dhc._key,
        name: name,
        args: args
      });

      this._emitter.emit("$$run:".concat(name), {
        controller: this._dhc._key,
        args: args
      });

      return (_this$_runner = this._runner)[name].apply(_this$_runner, args);
    }
  }]);

  return RunnerManager;
}(_Component2.default), (_applyDecoratedDescriptor(_class.prototype, "hasRunner", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "hasRunner"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unRegister", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "unRegister"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "register", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "register"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "run", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "run"), _class.prototype)), _class);
exports.default = RunnerManager;
RunnerManager.publicMethods = publicMethods;