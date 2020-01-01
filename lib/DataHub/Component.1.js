"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Emitter = _interopRequireDefault(require("./Emitter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function publicMethod(_prototype, name, descriptor) {
  var old = _prototype[name];

  if (!_prototype._publicMethods) {
    _prototype._publicMethods = [];
  }

  _prototype._publicMethods.push(name);

  descriptor.value = function () {
    if (this._destroyed) {
      this.destroyedErrorLog && this.destroyedErrorLog(name);
      return _Utils.udFun;
    }

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var result = old.bind(this).apply(void 0, args);
    var _result = result;

    if (result instanceof Component) {
      _result = '#Component:' + result._logName;
    }

    this.devLog && this.devLog("#run:".concat(name), args, _result);
    return result;
  };
}

var Component =
/*#__PURE__*/
function () {
  function Component() {
    var _this = this;

    _classCallCheck(this, Component);

    this._key = (0, _Utils.getUniIndex)();
    this._clazz = this.constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    var container = arguments.length <= 0 ? undefined : arguments[0];

    if (_typeof(container) !== 'object') {
      container = {};
    }

    var _devMode;

    if (arguments.length < 2) {
      _devMode = false;
    } else {
      var _ref;

      _devMode = !!(_ref = arguments.length - 1, _ref < 0 || arguments.length <= _ref ? undefined : arguments[_ref]);
    }

    this._devMode = _devMode;
    this._dhc = container._dhc || null;
    this._dh = container._dh || null;
    this._store = container._store || null;
    this._emitter = container._emitter || _Utils.udFun;
    this.devLog = _devMode ? container.devLog.createLog(this._logName) : _Utils.udFun;
    this.errLog = container.errLog.createLog(this._logName);

    this.methodErrLog = function (name, args, desc, msg) {
      if (_this.devLog && _this.devLog !== _Utils.udFun) {
        _this.devLog("#runErr:".concat(name), args, desc);
      } else if (_this.errLog) {
        _this.errLog(msg);
      }
    };

    this.destroyedErrorLog = function (name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (_this.devLog && _this.devLog !== _Utils.udFun) {
        _this.devLog("#runErr:".concat(name), args, 'destroyed');
      } else if (_this.errLog) {
        _this.errLog("can't run '".concat(_this._clazz, ".").concat(name, "(").concat(args.join(','), ")' after destroyed."));
      }
    };

    this._emitter.once("$$destroy:".concat(container._clazz, "=").concat(container._key), function () {
      _this.devLog && _this.devLog("".concat(container._clazz, "=").concat(container._key, " destroyed => ").concat(_this._logName, " destroyed ."));

      _this.destroy();
    });

    this.afterCreate.apply(this, arguments);

    if (_Utils.createLog.showPublicMethods) {
      this.devLog("publicMethods of ".concat(this._clazz), this.constructor.prototype._publicMethods);
    }

    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(Component, [{
    key: "afterCreate",
    value: function afterCreate() {
      this.errLog("must implement afterCreate.");
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      this.errLog("must implement beforeDestroy.");
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key, this._name);

      this._emitter.emit("$$destroy:".concat(this._clazz, "=").concat(this._key), this._name);

      if (!(0, _Utils.isNvl)(this._name)) {
        this._emitter.emit("$$destroy:".concat(this._clazz, "@").concat(this._name), this._key);

        this._emitter.emit("$$destroy:".concat(this._clazz, "@").concat(this._name, "=").concat(this._key));
      }

      this.beforeDestroy();
      this._destroyed = true;
      this._dh = null;
      this._dhc = null;
      this._store = null;
      this._emitter = null;
      this.devLog = null;
      this.methodErrLog = null;
      this._name = null;
      this._key = null;
    }
  }]);

  return Component;
}();

exports.default = Component;
Component.publicMethod = publicMethod;