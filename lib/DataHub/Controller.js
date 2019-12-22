"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = _interopRequireDefault(require("./Fetcher"));

var _DataHub = require("./DataHub");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var eventOpMethods = ['when', 'whenAll', 'on', 'once', 'emit', 'destroy'];

var Controller =
/*#__PURE__*/
function () {
  function Controller(dh) {
    var _this = this;

    _classCallCheck(this, Controller);

    this._key = (0, _Utils.getUniIndex)();
    this._dh = dh;
    this._emitter = dh._emitter;
    this._destroyed = false;
    this._switchStatus = {};
    this._paginationData = {};
    this._errorMSg = {};
    this.publicFunction = {};
    this._offSet = new Set();
    this.devLog = this._dh.devLog.createLog('Controller');
    this.errLog = this._dh.errLog.createLog('Controller');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var funName = _step.value;

        _this.publicFunction[funName] = function () {
          var _this$_dh;

          if (_this._destroyed) {
            _this.errLog("can't run '".concat(funName, "' event='").concat(name, "' after controller=").concat(_this._key, " destroy."));

            return funName === 'get' ? [] : null;
          }

          return (_this$_dh = _this._dh)[funName].apply(_this$_dh, arguments);
        };
      };

      for (var _iterator = _DataHub.dataOpMethods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _loop2 = function _loop2() {
      var funName = _eventOpMethods[_i];

      _this.publicFunction[funName] = function () {
        if (_this._destroyed) {
          _this.errLog("can't run '".concat(funName, "' event='").concat(name, "' after controller=").concat(_this._key, " destroy."));

          return _Utils.udFun;
        }

        return _this[funName].apply(_this, arguments);
      };
    };

    for (var _i = 0, _eventOpMethods = eventOpMethods; _i < _eventOpMethods.length; _i++) {
      _loop2();
    }
  }

  _createClass(Controller, [{
    key: "emit",
    value: function emit(name) {
      if (this._destroyed) {
        this.errLog("can't run 'emit' event='".concat(name, "' after controller=").concat(this._key, " destroy."));
        return;
      }

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this._emitter.apply(this, [name].concat(args));
    }
  }, {
    key: "fetch",
    value: function fetch(dhName, typeValue, param) {
      if (this._destroyed) {
        this.errLog("can't run 'fetch' event='".concat(name, "' after controller=").concat(this._key, " destroy."));
        return Primise.reject();
      }
    }
  }, {
    key: "when",
    value: function when(names, callback) {
      var _this2 = this;

      if ((0, _Utils.isNvl)(names)) {
        return _Utils.udFun;
      }

      var offList = [];
      names = [].concat(names);

      var checkReady = function checkReady() {
        if (_this2._destroyed || _this2._dh._destroyed) {
          return;
        }

        var dataList = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _name = _step2.value;

            if ((0, _Utils.isNvl)(_name)) {
              dataList.push([]);
              continue;
            }

            if (_this2._dh._data[name] === undefined) {
              return;
            } else {
              dataList.push(_this2._dh._data[name] || []);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        callback.apply(void 0, dataList);
      };

      names.forEach(function (_name) {
        var _off = _this2._emitter.on(_name, checkReady);

        offList.push(_off);
      });

      var off = function off() {
        if (!_this2._offSet.has(off)) {
          return;
        }

        _this2._offSet.delete(off);

        offList.forEach(function (fun) {
          return fun();
        });
      };

      this._offSet.add(off);

      return off;
    }
  }, {
    key: "whenAll",
    value: function whenAll(names, callback) {// TODO
    }
  }, {
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this3 = this;

      var _off = this._emitter[once ? 'once' : 'on'](name, callback);

      var off = function off() {
        if (!_this3._offSet.has(off)) {
          return;
        }

        _this3._offSet.delete(off);

        _off();
      };

      this._offSet.add(off);

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
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this._emitter.emit('$$destroy:controller', this._key);

      this.devLog("controller=".concat(this._key, " destroyed."));
      Array.from(this._offSet.values()).forEach(function (fun) {
        return fun();
      });
      this._destroyed = true;
      this._offSet = null;
      this._dh = null;
      this._emitter = null;
      this._errorMSg = null;
      this._switchStatus = null;
      this._paginationData = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return Controller;
}();

exports.default = Controller;