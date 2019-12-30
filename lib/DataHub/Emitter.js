"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _Utils = require("./../Utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Emitter =
/*#__PURE__*/
function () {
  function Emitter() {
    var devLog = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
    var errLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;

    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, Emitter);

    this._key = (0, _Utils.getUniIndex)();
    this._clazz = this.constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    this._core = new _events.EventEmitter();

    this._core.setMaxListeners(Infinity);

    this.devLog = _devMode ? devLog.createLog(this._logName) : _Utils.udFun;
    this.errLog = errLog.createLog(this._logName);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)(this._clazz, this._key);
    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(Emitter, [{
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this = this;

      if (this._destroyed) {
        this.destroyedErrorLog(once ? 'once' : 'on');
        return _Utils.udFun;
      }

      if ((0, _Utils.isNvl)(name)) {
        return _Utils.udFun;
      }

      this.devLog("listen in '".concat(name, "'").concat(once ? ' once' : '', "."));
      var hasOff = false;

      var off = function off() {
        if (hasOff || _this._destroyed) {
          return;
        }

        _this.devLog("removeListener '".concat(name, "'"));

        _this._core.removeListener(name, callback);
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
        this.destroyedErrorLog("emit");
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
}();

exports.default = Emitter;