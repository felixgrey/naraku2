"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRefreshRate = setRefreshRate;
exports.default = void 0;

var _Utils = require("./../Utils");

var _DataStore = _interopRequireDefault(require("./DataStore.js"));

var _FetchManager = _interopRequireDefault(require("./FetchManager.js"));

var _RunnerManager = _interopRequireDefault(require("./RunnerManager.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['createController', 'watch', 'isLoading', 'isLocked'];
var refreshRate = 40;

function setRefreshRate(v) {
  refreshRate = v;
}

var Controller =
/*#__PURE__*/
function () {
  function Controller(dh) {
    var _this = this;

    var _devMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Controller);

    this._key = (0, _Utils.getUniIndex)();
    this._clazz = this.constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    this._devMode = _devMode;
    this._watchSet = new Set();
    this._fetchingDatastore = {};
    this._refreshTime = Date.now();
    this._publicMethods = {};
    this._dh = dh;
    this._dhc = this;
    this._emitter = dh._emitter;
    this.devLog = _devMode ? dh.devLog.createLog(this._logName) : _Utils.udFun;
    this.errLog = dh.errLog.createLog(this._logName);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)(this._clazz, this._key);

    this._emitter.once("$$destroy:".concat(dh._clazz, ":").concat(dh._key), function () {
      _this.devLog && _this.devLog("".concat(dh._clazz, " destroyed => ").concat(_this._clazz, " destroy ."));

      _this.destroy();
    });

    this._fetchManager = new _FetchManager.default(this, refreshRate, _devMode);
    this._runnerManager = new _RunnerManager.default(this, _devMode);
    this._listenerManager = new ListenerManager(this, _devMode);

    this._initPublicMethods();

    this._initWatch();

    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(Controller, [{
    key: "_isStatus",
    value: function _isStatus(names) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'isLoading';

      if (this._destroyed) {
        this.destroyedErrorLog(type);
        return false;
      }

      if ((0, _Utils.isNvl)(names)) {
        return false;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _name = _step.value;

          if (this._dh.getDataStore(_name)[type]) {
            return true;
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

      return false;
    }
  }, {
    key: "isLoading",
    value: function isLoading(names) {
      return this._isStatus(names, 'isLoading');
    }
  }, {
    key: "isLocked",
    value: function isLocked(names) {
      return this._isStatus(names, 'isLocked');
    }
  }, {
    key: "_refresh",
    value: function _refresh() {
      if (this._destroyed) {
        return;
      }

      this._refreshTime = Date.now();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._watchSet[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var callback = _step2.value;
          callback();
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
    }
  }, {
    key: "_initWatch",
    value: function _initWatch() {
      var _this2 = this;

      var lagRefresh = function lagRefresh() {
        if (_this2._destroyed) {
          return;
        }

        clearTimeout(_this2.refreshTimeoutIndex);

        var time = Date.now() - _this2._refreshTime;

        if (time > refreshRate * 2) {
          _this2.devLog('refresh now', time);

          _this2._refresh();

          return;
        }

        _this2.refreshTimeoutIndex = setTimeout(function () {
          _this2.devLog('refresh lag', time);

          _this2._refresh();
        }, refreshRate);
      };

      var off1 = this._emitter.on('$$data', lagRefresh);

      var off2 = this._emitter.on('$$status', lagRefresh);

      this._emitter.once("$$destroy:Controller:".concat(this._key), function () {
        off1();
        off2();
      });
    }
  }, {
    key: "_initPublicMethods",
    value: function _initPublicMethods() {
      var _this3 = this;

      var allPublicMethods = {
        _dh: _DataStore.default.publicMethods,
        _fetchManager: _FetchManager.default.publicMethods,
        _runnerManager: _RunnerManager.default.publicMethods,
        _listenerManager: ListenerManager.publicMethods,
        'controller': publicMethods
      };

      var _loop = function _loop(instanceName) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          var _loop2 = function _loop2() {
            var methodName = _step3.value;

            _this3._publicMethods[methodName] = function () {
              var _this3$instanceName2;

              if (_this3._destroyed) {
                _this3.destroyedErrorLog(methodName);

                return _Utils.udFun;
              }

              if (instanceName === 'controller') {
                var _this3$instanceName;

                return (_this3$instanceName = _this3[instanceName])[methodName].apply(_this3$instanceName, arguments);
              }

              return (_this3$instanceName2 = _this3[instanceName])[methodName].apply(_this3$instanceName2, arguments);
            };
          };

          for (var _iterator3 = allPublicMethods[instanceName][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            _loop2();
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

      for (var instanceName in allPublicMethods) {
        _loop(instanceName);
      }
    }
  }, {
    key: "watch",
    value: function watch() {
      var _this4 = this;

      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

      if (this._destroyed) {
        this.destroyedErrorLog('watch');
        return _Utils.udFun;
      }

      var off = function off() {
        if (_this4._destroyed) {
          return;
        }

        if (!_this4._watchSet.has(callback)) {
          return;
        }

        _this4._watchSet.delete(callback);
      };

      this._watchSet.add(callback);

      callback();
      return off;
    }
  }, {
    key: "fetch",
    value: function fetch() {
      var _this$_fetchManager;

      if (this._destroyed) {
        this.destroyedErrorLog('fetch');
        return _Utils.udFun;
      }

      return (_this$_fetchManager = this._fetchManager).fetch.apply(_this$_fetchManager, arguments);
    }
  }, {
    key: "createController",
    value: function createController() {
      if (this._destroyed) {
        this.destroyedErrorLog('createController');
        return _Utils.udFun;
      }

      return new Controller(this._dh, this._devMode).getPublicMethods();
    }
  }, {
    key: "getPublicMethods",
    value: function getPublicMethods() {
      if (this._destroyed) {
        this.destroyedErrorLog('getPublicMethods');
        return {};
      }

      return _objectSpread({}, this._publicMethods);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));
      clearTimeout(this.refreshTimeoutIndex);

      this._fetchManager.destroy();

      this._fetchManager = null;

      this._runnerManager.destroy();

      this._runnerManager = null;

      this._listenerManager.destroy();

      this._fetchManager = null;

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key);

      this._emitter.emit("$$destroy:".concat(this._clazz, "=").concat(this._key));

      this._watchSet = null;
      this._dh = null;
      this._dhc = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return Controller;
}();

exports.default = Controller;
Controller.publicMethods = publicMethods.concat(_DataStore.default.publicMethods).concat(_RunnerManager.default.publicMethods).concat(ListenerManager.publicMethods).concat(_FetchManager.default.publicMethods);