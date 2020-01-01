"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// afterCreate beforeDestroy
function publicMethod(_prototype, name, descriptor) {
  var old = _prototype[name];

  if (!_prototype._publicMethods) {
    _prototype._publicMethods = [];
  }

  _prototype._publicMethods.push(name);

  descriptor.value = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (this._destroyed) {
      this.destroyedErrorLog && this.destroyedErrorLog(name, args);
      return _Utils.udFun;
    }

    if (!this._ready) {
      this.notReadyErrorLog && this.notReadyErrorLog(name, args);
      return _Utils.udFun;
    }

    var result = old.bind(this).apply(void 0, args);
    var _result = result;

    if (result instanceof LifeCycle) {
      _result = '#LifeCycleInstance:' + result._logName;
    }

    this.devLog && this.devLog("#run:".concat(name), args, _result);
    return result;
  };
}

var LifeCycle =
/*#__PURE__*/
function () {
  function LifeCycle() {
    var _ref,
        _this = this;

    _classCallCheck(this, LifeCycle);

    var _constructor = this.constructor;
    this._key = (0, _Utils.getUniIndex)();
    this._clazz = _constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    this._ready = true;
    this._devMode = !!(_ref = arguments.length - 1, _ref < 0 || arguments.length <= _ref ? undefined : arguments[_ref]);
    this.errLog = _Utils.udFun;
    this.devLog = _Utils.udFun;
    this._emitter = _Utils.udFun;

    if (_constructor.$loggerByParam) {
      var _ref2, _ref3;

      var arg_2 = (_ref2 = arguments.length - 2, _ref2 < 0 || arguments.length <= _ref2 ? undefined : arguments[_ref2]);

      if (!(0, _Utils.isNvl)(arg_2) && typeof arg_2.createLog === 'function') {
        this.errLog = arg_2.createLog(this._logName);
      }

      var arg_3 = (_ref3 = arguments.length - 3, _ref3 < 0 || arguments.length <= _ref3 ? undefined : arguments[_ref3]);

      if (!(0, _Utils.isNvl)(arg_3) && typeof arg_3.createLog === 'function') {
        this.devLog = arg_3.createLog(this._logName);
      }
    }

    this.methodErrLog = function () {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '?';
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var desc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'err';
      var msg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : desc;

      if (_this._devMode) {
        _this.devLog("#runErr:".concat(name), args, desc);
      } else {
        _this.errLog(msg);
      }
    };

    var notAbleErr = function notAbleErr(name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var type = arguments.length > 2 ? arguments[2] : undefined;

      if (_this._devMode) {
        _this.devLog("#runErr:".concat(name), args, type);
      } else {
        _this.errLog("can't run '".concat(_this._clazz, ".").concat(name, "(").concat(args.join(','), ")' when ").concat(type, "."));
      }
    };

    this.destroyedErrorLog = function (name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      notAbleErr(name, args = [], 'destroyed');
    };

    this.notReadyErrorLog = function (name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      notAbleErr(name, args = [], 'notReady');
    };

    if (this._initialization) {
      this._initialization.apply(this, arguments);
    }

    if (this.afterCreate) {
      this.afterCreate.apply(this, arguments);
    }

    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(LifeCycle, [{
    key: "afterCreate",
    value: function afterCreate() {}
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {}
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key, this._name);

      this._emitter.emit("$$destroy:".concat(this._clazz, "=").concat(this._key), this._name);

      if (!(0, _Utils.isNvl)(this._name)) {
        this._emitter.emit("$$destroy:".concat(this._clazz, "@").concat(this._name), this._key);

        this._emitter.emit("$$destroy:".concat(this._clazz, "@").concat(this._name, "=").concat(this._key));
      }

      if (this.beforeDestroy) {
        this.beforeDestroy();
      }

      if (this._destruction) {
        this._destruction();
      }

      this._destroyed = true;
      this._ready = false;
      this._emitter = _Utils.udFun;
      this._name = null;
      this._key = null;
      this.devLog("".concat(this._logName, " destroyed."));
    }
  }]);

  return LifeCycle;
}();

exports.default = LifeCycle;
LifeCycle.publicMethod = publicMethod;