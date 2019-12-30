"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

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

var publicMotheds = ['fetch'];
var publicMethod = _Component2.default.publicMethod;
var FetchManager = (_class =
/*#__PURE__*/
function (_Component) {
  _inherits(FetchManager, _Component);

  function FetchManager() {
    _classCallCheck(this, FetchManager);

    return _possibleConstructorReturn(this, _getPrototypeOf(FetchManager).apply(this, arguments));
  }

  _createClass(FetchManager, [{
    key: "afterCreate",
    value: function afterCreate(dhc) {
      var refreshRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 40;

      var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      this._fetchingDatastore = {};
      this._stopKeys = {};
      this._refreshRate = refreshRate;
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      Object.values(this._stopKeys).forEach(function (key) {
        (0, _Fetcher.stopFetchData)(key);
      });
      this._stopKeys = null;
      Object.values(this._fetchingDatastore).forEach(function (index) {
        clearTimeout(index);
      });
      this._fetchingDatastore = null;
    }
  }, {
    key: "fetch",
    value: function fetch(fetcher, data) {
      var _this = this;

      var dataInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var stop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var stopKey = (0, _Utils.createUid)('stopKey-');
      this._stopKeys[stopKey] = stopKey;

      var doStop = function doStop() {
        _this.devLog("stop fetch  ", fetcher, data, stopKey);

        _this.stopFetch(stopKey);
      };

      this._emitter.once("$$destroy:FetchManager:".concat(this._key), doStop);

      if (typeof stop === 'string') {
        this._emitter.once("$$data:".concat(stop), doStop);
      } else if (typeof stop === 'function') {
        stop(doStop);
      }

      return (0, _Fetcher.fetchData)(fetcher, data, dataInfo, stopKey).catch(function (err) {
        if (_this._destroyed) {
          return;
        }

        if (err === _Fetcher.ABORT_REQUEST) {
          _this.devLog('abort request: ', fetcher, data, stopKey);

          return;
        }

        return Promise.reject(err);
      });
    }
  }, {
    key: "stopFetch",
    value: function stopFetch(name) {
      if (this._stopKeys[name]) {
        (0, _Fetcher.stopFetchData)(this._stopKeys[name]);
        this._stopKeys[name] = null;
      }

      if (this._fetchingDatastore[name]) {
        clearTimeout(this._fetchingDatastore[name]);
        this._fetchingDatastore[name] = null;
      }
    }
  }, {
    key: "fetchStoreData",
    value: function fetchStoreData() {
      var _this2 = this;

      var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _param$name = param.name,
          name = _param$name === void 0 ? null : _param$name,
          _param$data = param.data,
          data = _param$data === void 0 ? {} : _param$data,
          _param$clear = param.clear,
          clear = _param$clear === void 0 ? false : _param$clear,
          _param$force = param.force,
          force = _param$force === void 0 ? false : _param$force,
          _param$before = param.before,
          before = _param$before === void 0 ? _Utils.udFun : _param$before,
          _param$after = param.after,
          after = _param$after === void 0 ? _Utils.udFun : _param$after;
      clearTimeout(this._fetchingDatastore[name]);
      this._fetchingDatastore[name] = setTimeout(function () {
        if (_this2._destroyed) {
          return;
        }

        var ds = _this2._dh.getDataStore(name);

        var pagination = ds.getPaginationManager();

        var _ds$getStoreConfig = ds.getStoreConfig(),
            _ds$getStoreConfig$fe = _ds$getStoreConfig.fetcher,
            fetcher = _ds$getStoreConfig$fe === void 0 ? null : _ds$getStoreConfig$fe;

        if (!fetcher) {
          _this2.devLog("fetchStoreData failed: store=".concat(name, " no fetcher."));

          return;
        }

        if (ds.isLocked()) {
          _this2.errLog("can't fetch ".concat(name, " when it is locked"));

          return;
        }

        if (!force && ds.isLoading()) {
          _this2.errLog("can't fetch ".concat(name, " when it is loading"));

          return;
        }

        pagination.stopFetch();
        ds.clearLoading();

        _this2.stopFetch(_this2._stopKeys[name]);

        var stopKey = _this2._stopKeys[name] = (0, _Utils.createUid)('stopKey-');

        if (clear) {
          before();
          ds.clear();
          pagination.setCount(0);
          after();
          return;
        }

        var pagePromise = pagination.fetch(data);

        var dataInfo = _objectSpread({
          dataStore: true,
          name: name
        }, pagination.getPageInfo());

        before();
        ds.loading();
        var resultData = [];
        var errorMsg = null; // fetcher, data = null, dataInfo = {}, stopKey = null

        var dataPromise = (0, _Fetcher.fetchData)(fetcher, data, dataInfo, stopKey).then(function (result) {
          resultData = result;
        }).catch(function (err) {
          errorMsg = err;
        });
        Promise.all([dataPromise, pagePromise]).finally(function () {
          if (!_this2._destroyed) {
            if (errorMsg !== null) {
              ds.clearLoading();

              if (errorMsg !== _Fetcher.ABORT_REQUEST) {
                ds.setErrorMsg(errorMsg);
              }
            } else {
              ds.loaded(resultData);
            }
          }

          after();
        });
      }, this._refreshRate);
    }
  }]);

  return FetchManager;
}(_Component2.default), (_applyDecoratedDescriptor(_class.prototype, "fetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "stopFetch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "stopFetch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "fetchStoreData", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "fetchStoreData"), _class.prototype)), _class);
exports.default = FetchManager;
FetchManager.publicMotheds = publicMotheds;