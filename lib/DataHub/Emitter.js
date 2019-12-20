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
    _classCallCheck(this, Emitter);

    this._key = (0, _Utils.getUniIndex)();
    this._core = new _events.EventEmitter();

    this._core.setMaxListeners(Infinity);

    this._destroyed = false;
    this.devLog = _Utils.udFun;
    this.errLog = _Utils.udFun;
  }

  _createClass(Emitter, [{
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this = this;

      if (this._destroyed) {
        this.errLog("can't listen '".concat(name, "' after emitter=").concat(this._key, " destroy."));
        return _Utils.udFun;
      }

      this.devLog("emitter=".concat(this._key, " listen in '").concat(name, "'").concat(once ? ' once' : '', "."));
      var hasOff = false;

      var off = function off() {
        if (hasOff || _this._destroyed) {
          return;
        }

        _this.devLog("emitter=".concat(_this._key, " removeListener '").concat(name, "'"));

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
        this.errLog("can't emit '".concat(name, "' after emitter=").concat(this._key, " destroy."));
        return;
      }

      this.devLog("emitter=".concat(this._key, " emit '").concat(name, "'"));

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_this$_core = this._core).emit.apply(_this$_core, [name].concat(args));
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.emit('$$destroy:emitter', this._key);
      this.devLog("emitter=".concat(this._key, " destroyed."));
      this._destroyed = true;

      this._core.removeAllListeners();

      this._core = null;
    }
  }]);

  return Emitter;
}();

exports.default = Emitter;