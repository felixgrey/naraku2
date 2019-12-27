"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMotheds = ['fetch'];

var FetchManager =
/*#__PURE__*/
function () {
  function FetchManager(dhc) {
    var _this = this;

    var refreshRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 40;

    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, FetchManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this._fetchingDatastore = {};
    this._stopKeys = {};
    this._refreshRate = refreshRate;
    this._controller = dhc;
    this._dh = dhc._dh;
    this._emitter = dhc._emitter;

    this._emitter.once("$$destroy:Controller:".concat(dhc._key), function () {
      _this.destroy();
    });

    this.devLog = _devMode ? dhc.devLog.createLog("FetchManager=".concat(this._key)) : _Utils.udFun;
    this.errLog = dhc.errLog.createLog("FetchManager=".concat(this._key));
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('FetchManager', this._key);
    this.devLog("FetchManager=".concat(this._key, " created."));
  }

  _createClass(FetchManager, [{
    key: "fetch",
    value: function fetch(fetcher, data) {
      var _this2 = this;

      var dataInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var stop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      if (this._destroyed) {
        this.destroyedErrorLog('fetch');
        return _Utils.udFun;
      }

      var stopKey = (0, _Utils.createUid)('stopKey-');
      this._stopKeys[stopKey] = stopKey;

      var doStop = function doStop() {
        _this2.devLog("stop fetch  ", fetcher, data, stopKey);

        _this2.stopFetch(stopKey);
      };

      this._emitter.once("$$destroy:FetchManager:".concat(this._key), doStop);

      if (typeof stop === 'string') {
        this._emitter.once("$$data:".concat(stop), doStop);
      } else if (typeof stop === 'function') {
        stop(doStop);
      }

      return (0, _Fetcher.fetchData)(fetcher, data, dataInfo, stopKey).catch(function (err) {
        if (_this2._destroyed) {
          return;
        }

        if (err === _Fetcher.ABORT_REQUEST) {
          _this2.devLog('abort request: ', fetcher, data, stopKey);

          return;
        }

        return Promise.reject(err);
      });
    }
  }, {
    key: "stopFetch",
    value: function stopFetch(name) {
      if (this._destroyed || (0, _Utils.isNvl)(name)) {
        this.devLog("stopFetch failed: destroyed=".concat(this._destroyed, ", name=").concat(name));
        return;
      }

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
      var _this3 = this;

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

      if (this._destroyed || (0, _Utils.isNvl)(name)) {
        this.devLog("fetchStoreData failed: destroyed=".concat(this._destroyed, ", name=").concat(name));
        return;
      }

      clearTimeout(this._fetchingDatastore[name]);
      this._fetchingDatastore[name] = setTimeout(function () {
        if (_this3._destroyed) {
          return;
        }

        var ds = _this3._dh.getDataStore(name);

        var pagination = _this3._dh.getPaginationManager(name);

        var _ds$getStoreConfig = ds.getStoreConfig(),
            _ds$getStoreConfig$fe = _ds$getStoreConfig.fetcher,
            fetcher = _ds$getStoreConfig$fe === void 0 ? null : _ds$getStoreConfig$fe;

        if (!fetcher) {
          _this3.devLog("fetchStoreData failed: store=".concat(name, " no fetcher."));

          return;
        }

        if (ds.isLocked()) {
          _this3.errLog("can't fetch ".concat(name, " when it is locked"));

          return;
        }

        if (!force && ds.isLoading()) {
          _this3.errLog("can't fetch ".concat(name, " when it is loading"));

          return;
        }

        pagination.stopFetch();
        ds.clearLoading();

        _this3.stopFetch(_this3._stopKeys[name]);

        var stopKey = _this3._stopKeys[name] = (0, _Utils.createUid)('stopKey-');

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
          if (!_this3._destroyed) {
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
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("FetchManager=".concat(this._key, " destroyed."));

      this._emitter.emit('$$destroy:FetchManager', this._key);

      this._emitter.emit("$$destroy:FetchManager:".concat(this._key));

      Object.values(this._stopKeys).forEach(function (key) {
        (0, _Fetcher.stopFetchData)(key);
      });
      this._stopKeys = null;
      Object.values(this._fetchingDatastore).forEach(function (index) {
        clearTimeout(index);
      });
      this._fetchingDatastore = null;
      this._destroyed = true;
      this._dh = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return FetchManager;
}();

exports.default = FetchManager;
FetchManager.publicMotheds = publicMotheds;