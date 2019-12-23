"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = _interopRequireDefault(require("./Fetcher"));

var _DataHub = require("./DataHub");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var controllerOpMethods = ['when', 'whenAll', 'on', 'once', 'emit', 'first', 'getValue', 'clear', 'getSwitchStatus', 'setSwitchStatus', 'destroy'];

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
    this.publicFunction = {};
    this._offSet = new Set();
    this.dstroyedErrorLog = (0, _Utils.createDstroyedErrorLog)('Controller', this._key);
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

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          if (_this._destroyed) {
            _this.dstroyedErrorLog(funName, args);

            return [];
          } // this.devLog('publicFunction.' + funName + '@controller=' + this._key, args);


          return (_this$_dh = _this._dh)[funName].apply(_this$_dh, args);
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
      var funName = _controllerOpMethods[_i];

      _this.publicFunction[funName] = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (_this._destroyed) {
          _this.dstroyedErrorLog(funName, args);

          return _Utils.udFun;
        } // this.devLog('publicFunction.' + funName + '@controller=' + this._key, args);


        return _this[funName].apply(_this, args);
      };
    };

    for (var _i = 0, _controllerOpMethods = controllerOpMethods; _i < _controllerOpMethods.length; _i++) {
      _loop2();
    }

    this.publicFunction.stopFetchData = function () {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('stopFetchData');

        return null;
      } // TODO

    };

    this.publicFunction.fetchData = function () {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('fetchData');

        return null;
      } // TODO

    };

    this.publicFunction.stopFetchDataByName = function () {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('stopFetchDataByName');

        return null;
      } // TODO

    };

    this.publicFunction.createController = function () {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('createController');

        return null;
      }

      return new Controller(_this._dh).publicFunction;
    };
  }

  _createClass(Controller, [{
    key: "getSwitchStatus",
    value: function getSwitchStatus() {// TODO
    }
  }, {
    key: "setSwitchStatus",
    value: function setSwitchStatus() {// TODO
    }
  }, {
    key: "first",
    value: function first(dhName) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.getValue(dhName + '.0', defaultValue);
    }
  }, {
    key: "getValue",
    value: function getValue(fullPath, defaultValue) {
      var _fullPath$split = fullPath.split('.'),
          _fullPath$split2 = _toArray(_fullPath$split),
          dhName = _fullPath$split2[0],
          pathArr = _fullPath$split2.slice(1);

      return (0, _Utils.getDeepValue)(this._dh.get(dhName), pathArr.join('.'), defaultValue);
    }
  }, {
    key: "stopFetchData",
    value: function stopFetchData(dhName) {
      this._emitter.emit('$$stopFetchData', dhName); // TODO

    }
  }, {
    key: "emit",
    value: function emit(name) {
      var _this$_emitter;

      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      return (_this$_emitter = this._emitter).emit.apply(_this$_emitter, [name].concat(args));
    }
  }, {
    key: "clear",
    value: function clear(name) {
      if (this._dh.hasData(name)) {
        this._dh.set(name, []);
      }
    }
  }, {
    key: "fetch",
    value: function fetch(dhName, typeValue, param) {
      if (this._destroyed) {
        this.errLog("can't run 'fetch' '".concat(dhName, "' after controller=").concat(this._key, " destroy."));
        return Primise.reject();
      } // TODO

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

            if (!_this2._dh.hasData(_name)) {
              return;
            } else {
              dataList.push(_this2._dh.get(_name));
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
        var _off = _this2._emitter.on('$$data:' + _name, checkReady);

        offList.push(_off);
      });
      checkReady();

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
    value: function whenAll(names, callback) {
      var _this3 = this;

      if ((0, _Utils.isNvl)(names)) {
        return _Utils.udFun;
      }

      names = [].concat(names);
      var offList;

      var createCheckReady = function createCheckReady() {
        var readyCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
        var readyCount = 0;
        return function () {
          readyCount++;

          if (readyCount === names.length) {
            readyCallback.apply(void 0, _toConsumableArray(names.map(function (_name) {
              return _this3._dh.get(_name);
            })));
          }
        };
      };

      var watchReady = function watchReady() {
        if (_this3._destroyed || _this3._dh._destroyed) {
          return;
        }

        offList = [];
        var checkReady = createCheckReady(function () {
          callback.apply(void 0, arguments);
          watchReady();
        });
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _name = _step3.value;

            var _off = _this3._emitter.once('$$data:' + _name, checkReady);

            offList.push(_off);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      };

      watchReady();

      if (names.filter(function (_name) {
        return _this3._dh.hasData(_name);
      }).length === names.length) {
        callback.apply(void 0, _toConsumableArray(names.map(function (_name) {
          return _this3._dh.get(_name);
        })));
      }

      return function () {
        if (_this3._destroyed || _this3._dh._destroyed) {
          return;
        }

        if (!offList) {
          return;
        }

        offList.forEach(function (off) {
          return off();
        });
        offList = null;
      };
    }
  }, {
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this4 = this;

      var _off = this._emitter[once ? 'once' : 'on'](name, callback);

      var off = function off() {
        if (!_this4._offSet.has(off)) {
          return;
        }

        _this4._offSet.delete(off);

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
      this._switchStatus = null;
      this._paginationData = null;
      this.devLog = null;
      this.errLog = null;
    }
  }]);

  return Controller;
}();

exports.default = Controller;