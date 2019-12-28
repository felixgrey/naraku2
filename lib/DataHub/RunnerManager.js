"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['hasRunner', 'unRegister', 'register', 'run'];

var RunnerManager =
/*#__PURE__*/
function () {
  function RunnerManager(dhc) {
    var _this = this;

    var _devMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, RunnerManager);

    this._key = (0, _Utils.getUniIndex)();
    this._clazz = this.constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    this._runner = {};
    this._dhc = dhc;
    this._emitter = dhc._emitter;
    this.devLog = _devMode ? dhc.devLog.createLog(this._logName) : _Utils.udFun;
    this.errLog = dhc.errLog.createLog(this._logName);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)(this._clazz, this._key);

    this._emitter.once("$$destroy:Controller:".concat(dhc._key), function () {
      _this.devLog && _this.devLog("Controller destroyed => ".concat(_this._clazz, " destroy ."));

      _this.destroy();
    });

    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(RunnerManager, [{
    key: "hasRunner",
    value: function hasRunner(name) {
      if (this._destroyed) {
        this.destroyedErrorLog('hasRunner');
        return false;
      }

      if ((0, _Utils.isNvl)(name)) {
        return false;
      }

      return !!this._runner[name];
    }
  }, {
    key: "unRegister",
    value: function unRegister(name) {
      if (this._destroyed) {
        this.destroyedErrorLog('unRegister');
        return;
      }

      if ((0, _Utils.isNvl)(name)) {
        return;
      }

      delete this._runner[name];
    }
  }, {
    key: "register",
    value: function register(name, callback) {
      if (this._destroyed) {
        this.destroyedErrorLog('register');
        return;
      }

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

      if (this._destroyed) {
        this.destroyedErrorLog('run');
        return _Utils.udFun;
      }

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
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key);

      this._emitter.emit("$$destroy:".concat(this._clazz, ":").concat(this._key));

      this._runner = null;
      this._destroyed = true;
      this._dhc = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return RunnerManager;
}();

exports.default = RunnerManager;
RunnerManager.publicMethods = publicMethods;