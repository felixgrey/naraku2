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

var FetchManager =
/*#__PURE__*/
function () {
  function FetchManager(dhc, refreshRate) {
    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, FetchManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this._refreshRate = refreshRate;
    this._fetchingDatastore = {};
    this._stopKeys = {};
    this._controller = dhc;
    this._dh = dhc._dh;
    this._emitter = dhc._emitter;
    this.devLog = _devMode ? dhc.devLog.createLog("FetchManager=".concat(this._key)) : _Utils.udFun;
    this.errLog = dhc.errLog.createLog("FetchManager=".concat(this._key));
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('FetchManager', this._key);
    this.devLog('created.');
  }

  _createClass(FetchManager, [{
    key: "fetch",
    value: function fetch() {}
  }, {
    key: "stopFetchByKey",
    value: function stopFetchByKey() {}
  }, {
    key: "stopFetchByName",
    value: function stopFetchByName(name) {
      this._dh.getDataStore(name).stopFetch();

      if (this._stopKeys[name]) {
        (0, _Fetcher.stopFetchData)(this._stopKeys[name]);
        this._stopKeys[name] = null;
      }
    }
  }, {
    key: "fetchStoreData",
    value: function fetchStoreData(param) {
      var _this = this;

      var name = param.name,
          data = param.data,
          clear = param.clear,
          force = param.force,
          _param$before = param.before,
          before = _param$before === void 0 ? _Utils.udFun : _param$before,
          _param$after = param.after,
          after = _param$after === void 0 ? _Utils.udFun : _param$after;
      clearTimeout(this._fetchingDatastore[name]);
      this._fetchingDatastore[name] = setTimeout(function () {
        if (_this._destroyed) {
          return;
        }

        var ds = _this._dh.getDataStore(name);

        var pagination = _this._dh.getPaginationManager(name);

        if (ds.isLocked()) {
          _this.errLog("can't fetch ".concat(name, " when it is locked"));

          return;
        }

        if (!force && ds.isLoading()) {
          _this.errLog("can't fetch ".concat(name, " when it is loading"));

          return;
        }

        _this.stopFetchByName(name);

        ds.clearLoading();
        var stopKey = _this._stopKeys[name] = (0, _Utils.createUid)('stopKey-');

        if (clear) {
          before();
          ds.clear();
          pagination.setCount(0);
          after();
          return;
        }

        var pagePromise = pagination.fetch(data);

        var dataInfo = _objectSpread({}, pagination.getPageInfo());

        before();
        ds.loading();
        var resultData = [];
        var errorMsg = null; // name, data = null, dataInfo = {}, stopKey = null

        var dataPromise = (0, _Fetcher.fetchData)(name, data, dataInfo, stopKey).then(function (result) {
          resultData = result;
        }).catch(function (err) {
          errorMsg = err;
        });
        Promise.all([dataPromise, pagePromise]).finally(function () {
          if (!_this._destroyed) {
            if (errorMsg !== null) {
              ds.clearLoading();
              ds.setErrorMsg(errorMsg);
            } else {
              ds.loaded(result);
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

      Object.values(this._fetchingDatastore).forEach(function (index) {
        clearTimeout(index);
      });
      this._fetchingDatastore = null; // TODO
    }
  }]);

  return FetchManager;
}();

exports.default = FetchManager;