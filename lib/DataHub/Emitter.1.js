"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _Utils = require("./../Utils");

var _LifeCycle2 = _interopRequireDefault(require("./../LifeCycle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var publicMethod = _LifeCycle2.default.publicMethod;

var Emitter =
/*#__PURE__*/
function (_LifeCycle) {
  _inherits(Emitter, _LifeCycle);

  function Emitter() {
    var _this;

    var devLog = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
    var errLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;

    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, Emitter);

    _this._key = (0, _Utils.getUniIndex)();
    _this._clazz = _this.constructor.name;
    _this._logName = "".concat(_this._clazz, "=").concat(_this._key);
    _this._destroyed = false;
    _this._core = new _events.EventEmitter();

    _this._core.setMaxListeners(Infinity);

    _this.devLog = _devMode ? devLog.createLog(_this._logName) : _Utils.udFun;
    _this.errLog = errLog.createLog(_this._logName);

    _this.devLog("".concat(_this._logName, " created."));

    return _possibleConstructorReturn(_this);
  }

  _createClass(Emitter, [{
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this2 = this;

      if (this._destroyed) {
        this.errLog("can't run on or once after destroyed.");
        return _Utils.udFun;
      }

      if ((0, _Utils.isNvl)(name)) {
        return _Utils.udFun;
      }

      this.devLog("listen in '".concat(name, "'").concat(once ? ' once' : '', "."));
      var hasOff = false;

      var off = function off() {
        if (hasOff || _this2._destroyed) {
          return;
        }

        _this2.devLog("removeListener '".concat(name, "'"));

        _this2._core.removeListener(name, callback);
      };

      this._core[once ? 'once' : 'on'](name, callback);

      return off;
    }
  }, {
    key: "on",
    value: function on(name, callback) {
      return this._onAndOnce(name, callback, false);
    }
  }, {
    key: "once",
    value: function once(name, callback) {
      return this._onAndOnce(name, callback, true);
    }
  }, {
    key: "emit",
    value: function emit(name) {
      var _this$_core;

      if (this._destroyed) {
        this.errLog("can't run emit after destroyed.");
        return;
      }

      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this.devLog("emit '".concat(name, "'"), "argsLength=".concat(args.length));

      (_this$_core = this._core).emit.apply(_this$_core, [name].concat(args));
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));
      this.emit("$$destroy:".concat(this._clazz), this._key);
      this.emit("$$destroy:".concat(this._clazz, "=").concat(this._key));

      this._core.removeAllListeners();

      this._destroyed = true;
      this._core = null;
      this._key = null;
    }
  }]);

  return Emitter;
}(_LifeCycle2.default);

exports.default = Emitter;
Emitter.$loggerByParam = true;