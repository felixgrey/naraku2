"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRefreshRate = setRefreshRate;
exports.getAllMethods = getAllMethods;
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

var _DataHub = require("./DataHub");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var controllerOpMethods = ['when', 'whenAll', 'on', 'once', 'emit', 'first', 'getValue', 'clear', 'isLoading', 'isLocked', 'register', 'run', 'getSwitchStatus', 'turnOn', 'turnOff', 'destroy'];
var controllerOpMethods2 = ['stopByName', 'pageTo', 'changePageSize', 'getPageInfo', 'fetch', 'watch', 'createController'];
var refreshRate = 40;

function setRefreshRate(value) {
  refreshRate = +value;
} // console.log(dataOpMethods);


var Controller =
/*#__PURE__*/
function () {
  function Controller(dh) {
    var _this = this;

    _classCallCheck(this, Controller);

    this.register = function () {// TODO
    };

    this.run = function () {} // TODO
    // publicMethod
    ;

    this.stopByName = function (dhName) {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('stopByName');

        return null;
      } // this.devLog('stopByName', dhName, this._stopKeys[dhName]);


      if (_this._stopKeys[dhName]) {
        (0, _Fetcher.stopFetchData)(_this._stopKeys[dhName]);
        _this._stopKeys[dhName] = null;

        if (_this._paginationData[dhName]) {
          _this._paginationData[dhName].stopFetch();
        }

        _this._dh.setStatus(dhName, 'clearLoading');
      }
    };

    this.pageTo = function (dhName, number) {
      _this.changePageInfo(dhName, number, null);
    };

    this.changePageSize = function (dhName, pageSize) {
      _this.changePageInfo(dhName, null, pageSize);
    };

    this.getPageInfo = function (dhName) {
      if (!_this._paginationData[dhName]) {
        return null;
      }

      return _this._paginationData[dhName].getPaginationInfo(null);
    };

    this.turnOn = function (dhName) {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('turnOn');

        return;
      }

      _this._dh._configManager.turnOn(dhName);
    };

    this.turnOff = function (dhName) {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('turnOn');

        return;
      }

      _this._dh._configManager.turnOff(dhName);
    };

    this.fetch = function (fetcher, data, stop) {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('fetch');

        return null;
      }

      var stopKey = (0, _Utils.createUid)('stopFetchKey_');

      if (!(0, _Utils.isNvl)(stop)) {
        var hasStop = false;

        var doStop = function doStop() {
          if (hasStop) {
            return;
          }

          hasStop = true;
          (0, _Fetcher.stopFetchData)(stopKey);
        };

        if (typeof stop === 'function') {
          stop(doStop);
        } else {
          _this.once("$$data:".concat(stop), doStop);

          _this.once("$$status:".concat(stop), doStop);
        }
      }

      _this.once('$$destroy:controller', function (key) {
        if (key === _this._key) {
          (0, _Fetcher.stopFetchData)(stopKey);
        }
      });

      return (0, _Fetcher.fetchData)(fetcher, data, null, null, stopKey).then(function (result) {
        if (_this._destroyed) {
          return;
        }

        if (result !== undefined) {
          result = [].concat(result);
        }

        _this._emitter.emit('$$data', {
          name: '$$fetch',
          value: result
        });

        return result;
      }).catch(function (err) {
        if (_this._destroyed) {
          return;
        }

        _this._emitter.emit('$$data', {
          name: '$$fetchError',
          value: undefined
        });
      });
    };

    this.watch = function () {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

      if (_this._destroyed) {
        _this.dstroyedErrorLog('watch');

        return _Utils.udFun;
      }

      callback();

      _this._watchList.push(callback);

      return function () {
        for (var i = 0; i < _this._watchList.length; i++) {
          if (_this._watchList[i] === callback) {
            _this._watchList[i].splice(i, 1);

            return;
          }
        }
      };
    };

    this.createController = function () {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('createController');

        return null;
      }

      return new Controller(_this._dh).publicFunction;
    };

    this.isLoading = function (names) {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('isLoading');

        return false;
      }

      return _this._anyStatus(names, 'loading');
    };

    this.isLocked = function (names) {
      if (_this._destroyed) {
        _this.dstroyedErrorLog('isLocked');

        return false;
      }

      return _this._anyStatus(names, 'locked');
    };

    this._key = (0, _Utils.getUniIndex)();
    this._dh = dh;
    this._emitter = dh._emitter;
    this._destroyed = false;
    this._fetchTimeouts = {};
    this._stopKeys = {};
    this._watchList = [];
    this._switchStatus = {};
    this._paginationData = {};
    this.publicFunction = {};
    this._offSet = new Set();
    this.dstroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('Controller', this._key);
    this.devLog = this._dh.devLog.createLog('Controller');
    this.errLog = this._dh.errLog.createLog('Controller'); // console.log(dataOpMethods);

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

    for (var _i2 = 0, _controllerOpMethods2 = controllerOpMethods2; _i2 < _controllerOpMethods2.length; _i2++) {
      var funName = _controllerOpMethods2[_i2];
      this.publicFunction[funName] = this[funName];
    }

    this.initWatch();
  }

  _createClass(Controller, [{
    key: "initWatch",
    value: function initWatch() {
      var _this2 = this;

      var watchChange = function watchChange() {
        clearTimeout(_this2.watchTimeoutIndex);
        _this2.watchTimeoutIndex = setTimeout(function () {
          _this2._watchList.forEach(function (fun) {
            return fun();
          });
        }, refreshRate);
      };

      this.on('$$data', watchChange);
      this.on('$$status', watchChange);
    }
  }, {
    key: "changePageInfo",
    // publicMethod
    value: function changePageInfo(dhName) {
      var number = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var pageSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (this._destroyed) {
        this.dstroyedErrorLog('pageTo');
        return;
      }

      if (!this._paginationData[dhName]) {
        this.errLog("can't change pageInfo of '".concat(dhName, "' ."));
        return;
      }

      this._paginationData[dhName].changePageInfo(number, pageSize);
    } // publicMethod

  }, {
    key: "getSwitchStatus",
    value: function getSwitchStatus(dhName) {
      if (this._destroyed) {
        this.dstroyedErrorLog('changeSwitchStatus');
        return null;
      }

      if ((0, _Utils.isNvl)(dhName)) {
        return null;
      }

      var switchStatusInfo = this._switchStatus[dhName];

      if (!switchStatusInfo) {
        return null;
      }

      return !switchStatusInfo.off;
    } // publicMethod

  }, {
    key: "_anyStatus",
    value: function _anyStatus(names, status) {
      if ((0, _Utils.isNvl)(names)) {
        return false;
      }

      names = [].concat(names);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _name = _step2.value;

          if (this._dh.getStatus(_name) === status) {
            return true;
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

      return false;
    } // publicMethod

  }, {
    key: "fetchData",
    value: function fetchData(fetcher, dhName, data) {
      var _this3 = this;

      var clear = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var forceFetch = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var beforeFetch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : _Utils.udFun;
      var returnResolve;
      var returnPromise = new Promise(function (_resolve) {
        returnResolve = _resolve;
      });

      if (this._destroyed) {
        this.dstroyedErrorLog('fetchData');
        returnResolve();
        return returnPromise;
      }

      clearTimeout(this._fetchTimeouts[dhName]);
      this._fetchTimeouts[dhName] = setTimeout(function () {
        if (_this3._destroyed) {
          returnResolve();
          return;
        }

        if (clear) {
          _this3._dh.set(dhName, []);

          returnResolve();
          return;
        }

        if (forceFetch) {
          // this.devLog('forceFetch中断请求', dhName, data);
          _this3.stopByName(dhName);
        }

        if (_this3._dh.getStatus(dhName) === 'loading') {
          _this3.errLog("can't fetchData ".concat(dhName, " when it is loading"));

          returnResolve();
          return;
        }

        var stopKey = _this3._stopKeys[dhName] = (0, _Utils.createUid)('stopKey_');
        var pagePromise = Promise.resolve();
        var pagination = _this3._paginationData[dhName] || null;
        var offStop = _Utils.udFun;

        if (pagination) {
          pagePromise = pagination.fetch(data);
          offStop = _this3.once('$$stopFetchData', function (name) {
            if (dhName === name) {
              pagination.stopFetch();
            }
          });
        }

        _this3._dh.setStatus(dhName, 'loading');

        beforeFetch();
        var dataPromise = (0, _Fetcher.fetchData)(fetcher, data, {}, pagination, stopKey);
        Promise.all([dataPromise, pagePromise]).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 1),
              resultData = _ref2[0];

          if (_this3._destroyed) {
            returnResolve();
            return;
          }

          _this3._dh.setStatus(dhName, 'clearLoading');

          _this3._dh.set(dhName, resultData);
        }).catch(function (err) {
          if (_this3._destroyed) {
            returnResolve();
            return;
          }

          _this3._dh.setError(dhName, err, []);
        }).finally(function () {
          if (_this3._destroyed) {
            returnResolve();
            return;
          }

          offStop();
          _this3._stopKeys[dhName] = null;
          returnResolve();
        });
      }, refreshRate);
      return returnPromise;
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
    key: "when",
    value: function when(names, callback) {
      var _this4 = this;

      if ((0, _Utils.isNvl)(names)) {
        return _Utils.udFun;
      }

      var offList = [];
      names = [].concat(names);

      var checkReady = function checkReady() {
        if (_this4._destroyed || _this4._dh._destroyed) {
          return;
        }

        var dataList = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _name = _step3.value;

            if ((0, _Utils.isNvl)(_name)) {
              dataList.push([]);
              continue;
            }

            if (!_this4._dh.hasData(_name)) {
              return;
            } else {
              dataList.push(_this4._dh.get(_name));
            }
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

        callback.apply(void 0, dataList);
      };

      names.forEach(function (_name) {
        var _off = _this4._emitter.on('$$data:' + _name, checkReady);

        offList.push(_off);
      });
      checkReady();

      var off = function off() {
        if (!_this4._offSet.has(off)) {
          return;
        }

        _this4._offSet.delete(off);

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
      var _this5 = this;

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
              return _this5._dh.get(_name);
            })));
          }
        };
      };

      var watchReady = function watchReady() {
        if (_this5._destroyed || _this5._dh._destroyed) {
          return;
        }

        offList = [];
        var checkReady = createCheckReady(function () {
          callback.apply(void 0, arguments);
          watchReady();
        });
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = names[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _name = _step4.value;

            var _off = _this5._emitter.once('$$data:' + _name, checkReady);

            offList.push(_off);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      };

      watchReady();

      if (names.filter(function (_name) {
        return _this5._dh.hasData(_name);
      }).length === names.length) {
        callback.apply(void 0, _toConsumableArray(names.map(function (_name) {
          return _this5._dh.get(_name);
        })));
      }

      var offFun = function offFun() {
        if (_this5._destroyed || _this5._dh._destroyed) {
          return;
        }

        if (!offList) {
          return;
        }

        offList.forEach(function (off) {
          return off();
        });
        offList = null;

        _this5._offSet.delete(offFun);
      };

      this._offSet.add(offFun);

      return offFun;
    }
  }, {
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this6 = this;

      var _off = this._emitter[once ? 'once' : 'on'](name, callback);

      var off = function off() {
        if (!_this6._offSet.has(off)) {
          return;
        }

        _this6._offSet.delete(off);

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
      } // 取消将要进行的刷新


      clearTimeout(this.watchTimeoutIndex); // 取消将要进行的数据请求

      Object.values(this._fetchTimeouts).forEach(function (key) {
        clearTimeout(key);
      }); // 中断进行中的数据请求

      Object.values(this._stopKeys).forEach(function (key) {
        if (key) {
          (0, _Fetcher.stopFetchData)(key);
        }
      }); // 发射销毁事件

      this._emitter.emit('$$destroy:controller', this._key); // this.devLog(`controller=${this._key} destroyed.`);
      // 在销毁事件之后解除监听


      Array.from(this._offSet.values()).forEach(function (fun) {
        return fun();
      }); // 释放资源

      this._destroyed = true;
      this._offSet = null;
      this._dh = null;
      this._emitter = null;
      this._switchStatus = null;
      this._paginationData = null;
      this._fetchTimeouts = null;
      this._stopKeys = null;
      this._watchList = null;
      this.devLog = null;
      this.errLog = null;
    }
  }]);

  return Controller;
}();

exports.default = Controller;
Controller.setRefreshRate = setRefreshRate; // console.log(dataOpMethods)
// const allPublicMethods = dataOpMethods.concat(controllerOpMethods).concat(controllerOpMethods2);

function getAllMethods() {
  return _DataHub.dataOpMethods.concat(controllerOpMethods).concat(controllerOpMethods2);
}

Controller.getAllMethods = getAllMethods;