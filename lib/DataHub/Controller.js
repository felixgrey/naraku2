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

var _ListenerManager = _interopRequireDefault(require("./ListenerManager.js"));

var _Component2 = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['createController', 'watch', 'isLoading', 'isLocked', 'isWillRefresh'];
var refreshRate = 40;
var publicMethod = _Component2.default.publicMethod;

function setRefreshRate(v) {
  refreshRate = v;
}

var Controller = (_class =
/*#__PURE__*/
function (_Component) {
  _inherits(Controller, _Component);

  function Controller() {
    _classCallCheck(this, Controller);

    return _possibleConstructorReturn(this, _getPrototypeOf(Controller).apply(this, arguments));
  }

  _createClass(Controller, [{
    key: "afterCreate",
    value: function afterCreate(dh) {
      this._dhc = this;
      this._fetchManager = new _FetchManager.default(this, refreshRate, this._devMode);
      this._runnerManager = new _RunnerManager.default(this, this._devMode);
      this._listenerManager = new _ListenerManager.default(this, this._devMode);
      this._publicMethods = {};
      this._watchSet = new Set();
      this._refreshTime = 0;
      this._willRefresh = false;

      this._initPublicMethods();

      this._initWatch();
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      clearTimeout(this.refreshTimeoutIndex);

      this._fetchManager.destroy();

      this._fetchManager = null;

      this._runnerManager.destroy();

      this._runnerManager = null;

      this._listenerManager.destroy();

      this._fetchManager = null;
      this._watchSet = null;
      this._publicMethods = null;
      this._willRefresh = false;
    }
  }, {
    key: "_isStatus",
    value: function _isStatus(names) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'isLoading';

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
    key: "isWillRefresh",
    value: function isWillRefresh() {
      return this._willRefresh;
    }
  }, {
    key: "_refresh",
    value: function _refresh() {
      if (this._destroyed) {
        return;
      }

      this._willRefresh = false;
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
      var _this = this;

      var lagRefresh = function lagRefresh() {
        if (_this._destroyed) {
          return;
        }

        clearTimeout(_this.refreshTimeoutIndex);
        _this._willRefresh = true;

        var time = Date.now() - _this._refreshTime;

        if (time > refreshRate * 2) {
          _this.devLog('refresh now', time);

          _this._refresh();

          return;
        }

        _this.refreshTimeoutIndex = setTimeout(function () {
          _this.devLog('refresh lag', time);

          _this._refresh();
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
      var _this2 = this;

      var allPublicMethods = {
        _dh: _DataStore.default.publicMethods,
        _fetchManager: _FetchManager.default.publicMethods,
        _runnerManager: _RunnerManager.default.publicMethods,
        _listenerManager: _ListenerManager.default.publicMethods,
        'controller': publicMethods
      };

      var _loop = function _loop(instanceName) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          var _loop2 = function _loop2() {
            var methodName = _step3.value;

            _this2._publicMethods[methodName] = function () {
              var _this2$instanceName;

              if (_this2._destroyed) {
                _this2.destroyedErrorLog(methodName);

                return _Utils.udFun;
              }

              if (instanceName === 'controller') {
                return _this2[methodName].apply(_this2, arguments);
              }

              return (_this2$instanceName = _this2[instanceName])[methodName].apply(_this2$instanceName, arguments);
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
      var _this3 = this;

      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

      var off = function off() {
        if (_this3._destroyed) {
          return;
        }

        if (!_this3._watchSet.has(callback)) {
          return;
        }

        _this3._watchSet.delete(callback);
      };

      this._watchSet.add(callback);

      callback();
      return off;
    }
  }, {
    key: "fetch",
    value: function fetch() {
      var _this$_fetchManager;

      return (_this$_fetchManager = this._fetchManager).fetch.apply(_this$_fetchManager, arguments);
    }
  }, {
    key: "createController",
    value: function createController() {
      return new Controller(this._dh, this._devMode).getPublicMethods();
    }
  }, {
    key: "getPublicMethods",
    value: function getPublicMethods() {
      return _objectSpread({}, this._publicMethods);
    }
  }]);

  return Controller;
}(_Component2.default), (_applyDecoratedDescriptor(_class.prototype, "isLoading", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLoading"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isLocked", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isLocked"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isWillRefresh", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isWillRefresh"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "watch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "watch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createController"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getPublicMethods", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getPublicMethods"), _class.prototype)), _class);
exports.default = Controller;
Controller.publicMethods = publicMethods.concat(_DataStore.default.publicMethods).concat(_RunnerManager.default.publicMethods).concat(_ListenerManager.default.publicMethods).concat(_FetchManager.default.publicMethods);