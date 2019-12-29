"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['on', 'once', 'when', 'whenAll', 'emit'];

var ListenerManager =
/*#__PURE__*/
function () {
  function ListenerManager(dhc) {
    var _this = this;

    var _devMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, ListenerManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this._dhc = dhc;
    this._dh = dhc._dh;
    this._emitter = dhc._emitter;
    this._offSet = new Set();
    this.devLog = _devMode ? dhc.devLog.createLog("ListenerManager=".concat(this._key)) : _Utils.udFun;
    this.errLog = dhc.errLog.createLog("ListenerManager=".concat(this._key));
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('', this._key);

    this._emitter.once("$$destroy:Controller:".concat(dhc._key), function () {
      _this.devLog && _this.devLog("Controller destroyed .");

      _this.destroy();
    });

    this.devLog("ListenerManager=".concat(this._key, " created."));
  }

  _createClass(ListenerManager, [{
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this2 = this;

      if (this._destroyed) {
        this.dstroyedErrorLog('on or once');
        return _Utils.udFun;
      }

      var _off = this._emitter[once ? 'once' : 'on'](name, callback);

      var off = function off() {
        if (!_this2._offSet.has(off)) {
          return;
        }

        _this2._offSet.delete(off);

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
    key: "emit",
    value: function emit(name) {
      var _this$_emitter;

      if (this._destroyed) {
        this.dstroyedErrorLog('emit');
        return _Utils.udFun;
      }

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_this$_emitter = this._emitter).emit.apply(_this$_emitter, [name].concat(args));
    }
  }, {
    key: "when",
    value: function when() {
      var _this3 = this;

      if (this._destroyed) {
        this.dstroyedErrorLog('when');
        return _Utils.udFun;
      }

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var callback = args.pop();
      var names = args;

      if (!names.length) {
        return _Utils.udFun;
      }

      var offList = [];

      var checkReady = function checkReady() {
        _this3.devLog("when checkReady");

        if (_this3._destroyed) {
          return;
        }

        var dataList = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _name = _step.value;

            if ((0, _Utils.isNvl)(_name)) {
              dataList.push([]);
              continue;
            }

            _this3.devLog("when ", _name, _this3._dh.getDataStore(_name).hasData());

            if (!_this3._dh.getDataStore(_name).hasData()) {
              return;
            } else {
              dataList.push(_this3._dh.getDataStore(_name).get());
            }
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

        callback.apply(void 0, dataList);
      };

      names.forEach(function (_name) {
        var _off = _this3._emitter.on('$$data:' + _name, checkReady);

        offList.push(_off);
      });
      this.devLog("when param : ", names);
      checkReady();

      var off = function off() {
        if (!_this3._offSet.has(off)) {
          return;
        }

        _this3._offSet.delete(off);

        offList.forEach(function (fun) {
          return fun();
        });
        offList = null;
      };

      this._offSet.add(off);

      return off;
    }
  }, {
    key: "whenAll",
    value: function whenAll() {
      var _this4 = this;

      if (this._destroyed) {
        this.dstroyedErrorLog('whenAll');
        return _Utils.udFun;
      }

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var callback = args.pop();
      var names = args;

      if (!names.length) {
        return _Utils.udFun;
      }

      var offList;

      var createCheckReady = function createCheckReady() {
        var readyCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
        var readyCount = 0;
        return function () {
          readyCount++;

          if (readyCount === names.length) {
            readyCallback.apply(void 0, _toConsumableArray(names.map(function (_name) {
              return _this4._dh.getDataStore(_name).get();
            })));
          }
        };
      };

      var watchReady = function watchReady() {
        if (_this4._destroyed || _this4._dh._destroyed) {
          return;
        }

        offList = [];
        var checkReady = createCheckReady(function () {
          callback.apply(void 0, arguments);
          watchReady();
        });
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _name = _step2.value;

            var _off = _this4._emitter.once('$$data:' + _name, checkReady);

            offList.push(_off);
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
      };

      watchReady();

      if (names.filter(function (_name) {
        return _this4._dh.getDataStore(_name).hasData();
      }).length === names.length) {
        callback.apply(void 0, _toConsumableArray(names.map(function (_name) {
          return _this4._dh.getDataStore(_name).get();
        })));
      }

      var off = function off() {
        if (_this4._destroyed) {
          return;
        }

        if (!_this4._offSet.has(off)) {
          return;
        }

        _this4._offSet.delete(off);

        offList.forEach(function (off) {
          return off();
        });
        offList = null;
      };

      this._offSet.add(off);

      return off;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("ListenerManager=".concat(this._key, " destroyed."));

      this._emitter.emit('$$destroy:ListenerManager', this._key);

      this._emitter.emit("$$destroy:ListenerManager:".concat(this._key));

      Array.from(this._offSet.values()).forEach(function (fun) {
        return fun();
      });
      this._offSet = null;
      this._destroyed = true;
      this._value = null;
      this._dh = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return ListenerManager;
}();

exports.default = ListenerManager;
ListenerManager.publicMethods = publicMethods;