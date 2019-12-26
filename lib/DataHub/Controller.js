"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRefreshRate = setRefreshRate;
exports.default = void 0;

var _Utils = require("./../Utils");

var _DataStore = _interopRequireDefault(require("./DataStore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['createController', 'watch', 'fetch'];
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
    this._destroyed = false;
    this._watchSet = new Set();
    this._fetchingDatastore = {};
    this._refreshTime = Date.now();
    this._publicMethods = {
      createController: function createController() {
        return _this.createController();
      },
      watch: function watch() {
        return _this.watch.apply(_this, arguments);
      },
      fetch: function fetch() {
        return _this.fetch.apply(_this, arguments);
      }
    };
    this._dh = dh;
    this._emitter = dh._emitter;
    this._offOnDestroy = dh._emitter.once('$$destroy:DataHub', function () {
      _this.destroy();
    });

    this._initDhPublicMethods();

    this._initWatch();

    this.devLog = _devMode ? dh.devLog.createLog("Controller=".concat(this._key)) : _Utils.udFun;
    this.errLog = dh.errLog.createLog("Controller=".concat(this._key));
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('Controller', this._key);
    this.devLog('created.');
  }

  _createClass(Controller, [{
    key: "_refresh",
    value: function _refresh() {
      this._refreshTime = Date.now();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._watchSet[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var callback = _step.value;
          callback();
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
    }
  }, {
    key: "_initWatch",
    value: function _initWatch() {
      var _this2 = this;

      var lagRefresh = function lagRefresh() {
        clearTimeout(_this2.refreshTimeoutIndex);

        var time = Date.now() - _this2._refreshTime;

        if (time > 60) {
          _this2.devLog('refresh now', time);

          _this2._refresh();

          return;
        }

        _this2.refreshTimeoutIndex = setTimeout(function () {
          _this2.devLog('refresh lag', time);

          _this2._refresh();
        }, refreshRate);
      };

      this._offWatchOnDestroy1 = this._emitter.on('$$data', lagRefresh);
      this._offWatchOnDestroy2 = this._emitter.on('$$status', lagRefresh);
    }
  }, {
    key: "_initDhPublicMethods",
    value: function _initDhPublicMethods() {
      var _this3 = this;

      _DataStore.default.publicMethods.forEach(function (methodName) {
        _this3._publicMethods[methodName] = function () {
          var _this3$_dh;

          if (_this3._destroyed) {
            _this3.destroyedErrorLog(methodName);

            return _Utils.udFun;
          }

          return (_this3$_dh = _this3._dh)[methodName].apply(_this3$_dh, arguments);
        };
      });
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
    value: function fetch(fetcher, data, stop) {// TODO
    }
  }, {
    key: "createController",
    value: function createController() {
      if (this._destroyed) {
        this.destroyedErrorLog('createController');
        return _Utils.udFun;
      }

      return new Controller(this._dh).getPublicMethods();
    }
  }, {
    key: "getPublicMethods",
    value: function getPublicMethods() {
      if (this._destroyed) {
        this.destroyedErrorLog('getPublicMethods');
        return _Utils.udFun;
      }

      return _objectSpread({}, this._publicMethods);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog('destroyed.');
      clearTimeout(this.refreshTimeoutIndex);

      this._offWatchOnDestroy1();

      this._offWatchOnDestroy2();

      this._emitter.emit('$$destroy:Controller', this._key);

      this._emitter.emit("$$destroy:Controller:".concat(this._key));

      this._watchSet.clear();

      this._offOnDestroy();

      this._offOnDestroy = null;
      this._dh = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this.destroyedErrorLog = null;
      this._key = null;
    }
  }]);

  return Controller;
}();

exports.default = Controller;
Controller.publicMethods = publicMethods.concat(_DataStore.default.publicMethods);