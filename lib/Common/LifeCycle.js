"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("../Utils");

var _ErrorType = _interopRequireDefault(require("./ErrorType"));

var _Union = _interopRequireDefault(require("./Union"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.keys(_ErrorType.default).forEach(name => {
  _ErrorType.default[name] = name;
});
_Utils.udFun.destroy = _Utils.udFun;

function publicMethod(prototypeOrInstance, name) {
  var descriptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var target = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'that';
  var old;

  if (descriptor) {
    old = prototypeOrInstance[name];
    _Utils.udFun[name] = _Utils.udFun;

    if (!prototypeOrInstance.$$publicMethods) {
      prototypeOrInstance.$$publicMethods = [];
    }

    prototypeOrInstance.$$publicMethods.push(name);
  } else {
    old = function old() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (typeof this[name] !== 'function') {
        this.methodErrLog("this.".concat(name), args, _ErrorType.default.notMethod);
        return;
      }

      return this[name](...args);
    };
  }

  var newMethod = function newMethod() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (this.destroyed) {
      this.destroyedErrorLog(name, args);
      return _Utils.udFun;
    }

    if (!this.ready) {
      this.notReadyErrorLog(name, args);
      return _Utils.udFun;
    }

    if (!this[target]) {
      this.methodErrLog("this.".concat(target), args, _ErrorType.default.notExist);
      return _Utils.udFun;
    }

    var result = old.bind(this[target])(...args);
    var logResult = result;

    if (result instanceof LifeCycle) {
      logResult = "#LifeCycleInstance:".concat(result.logName);
    } else if (typeof result === 'function') {
      logResult = "#function:".concat(result.name);
    }

    var logArgs = args.map(arg => {
      if (arg instanceof LifeCycle) {
        return "#LifeCycleInstance:".concat(arg.logName);
      }

      if (typeof arg === 'function') {
        return "#function:".concat(arg.name);
      }

      return arg;
    });
    this.devLog("#run:".concat(name), logArgs, logResult);
    return result;
  };

  if (descriptor) {
    descriptor.value = newMethod;
    return descriptor;
  }

  return newMethod;
}

class LifeCycle {
  constructor() {
    var _ref,
        _this = this;

    this.that = this;
    this.key = (0, _Utils.getUniIndex)();
    this.clazz = this.constructor.name;
    this.logName = "".concat(this.clazz, "=").concat(this.key);
    this.destroyed = false;
    this.ready = true;
    var union = (_ref = arguments.length - 1, _ref < 0 || arguments.length <= _ref ? undefined : arguments[_ref]);

    if (union instanceof _Union.default) {
      // console.log('------------------- bindUnion ', this.clazz)
      union.bindUnion(this, this.logName);
    } else {
      // console.log('------------------- new Union ', this.clazz)
      new _Union.default().bindUnion(this, this.logName);
    }

    this.publicMethods = function () {
      var publicMethods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'that';
      var instance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this;
      publicMethods.forEach(name => {
        instance[name] = publicMethod(_this, name, null, target).bind(_this);
      });
    };

    this.methodErrLog = function () {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '?';
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var errType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var msg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : errType;

      if (_this.devMode) {
        _this.devLog("#runErr:".concat(name), args, _ErrorType.default[errType]);
      } else {
        _this.errLog(msg);
      }
    };

    var notAbleErr = function notAbleErr(name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var errType = arguments.length > 2 ? arguments[2] : undefined;

      if (_this.devMode) {
        _this.devLog("#runErr:".concat(name), args, _ErrorType.default[errType]);
      } else {
        _this.errLog("can't run '".concat(_this.clazz, ".").concat(name, "(").concat(args.join(','), ")' when ").concat(type, "."));
      }
    };

    this.destroyedErrorLog = function (name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      notAbleErr(name, args = [], _ErrorType.default.destroyed);
    };

    this.notReadyErrorLog = function (name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      notAbleErr(name, args = [], _ErrorType.default.notReady);
    };

    if (this.initialization) {
      this.initialization(...arguments);
    }

    if (this.afterCreate) {
      this.afterCreate(...arguments);
    }

    this.devLog("".concat(this.logName, " created."));
  }

  updateLogger() {
    this.union = this.union.clone();

    if (this.devMode) {
      this.union.devLog = this.devLog;
    }

    this.union.errLog = this.errLog;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.emitter.emit("$$destroy:".concat(this.clazz), this._key, this.name);
    this.emitter.emit("$$destroy:".concat(this.clazz, "=").concat(this.key), this.name);

    if (!(0, _Utils.isNvl)(this.name)) {
      this.emitter.emit("$$destroy:".concat(this.clazz, "@").concat(this.name), this.key);
      this.emitter.emit("$$destroy:".concat(this.clazz, "@").concat(this.name, "=").concat(this.key));
    }

    if (this.beforeDestroy) {
      this.beforeDestroy();
    }

    if (this.destruction) {
      this.destruction();
    }

    this.destroyed = true;
    this.ready = false;
    this.union = null;
    this.name = null;
    this.key = null;
    this.devLog("".concat(this.logName, " destroyed."));
  }

}

exports.default = LifeCycle;
LifeCycle.publicMethod = publicMethod;