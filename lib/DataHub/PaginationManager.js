"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PaginationManager =
/*#__PURE__*/
function () {
  function PaginationManager(dh, name) {
    var _devMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, PaginationManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this._name = name;
    this._fetcher = null;
    this._jsonData = '';
    this._force = false;
    this._on = false;
    this._pageSize = 10;
    this._pageNumber = 1;
    this._startPage = 1;
    this._stopKey = null;
    this._count = 0;
    this._dh = dh;
    this.devLog = _devMode ? dh.devLog.createLog("PaginationManager=".concat(this._key)) : _Utils.udFun;
    this.errLog = dh.errLog.createLog("PaginationManager=".concat(this._key));
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)('PaginationManager', this._key);
    this.devLog('created.');
  }

  _createClass(PaginationManager, [{
    key: "setCount",
    value: function setCount(v) {
      if (this._destroyed) {
        this.destroyedErrorLog('setCount');
        return;
      }

      if (this._stopKey) {
        this.errLog(" ".concat(this._name, " can't set count when it is loading"));
        return;
      }

      this._count = v;
    }
  }, {
    key: "getCount",
    value: function getCount() {
      if (this._destroyed) {
        this.destroyedErrorLog('getCount');
        return 0;
      }

      return this._count;
    }
  }, {
    key: "setInit",
    value: function setInit() {
      var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _param$flag = param.flag,
          flag = _param$flag === void 0 ? false : _param$flag,
          _param$fetcher = param.fetcher,
          fetcher = _param$fetcher === void 0 ? null : _param$fetcher,
          _param$force = param.force,
          force = _param$force === void 0 ? false : _param$force,
          _param$startPage = param.startPage,
          startPage = _param$startPage === void 0 ? 1 : _param$startPage,
          _param$pageSize = param.pageSize,
          pageSize = _param$pageSize === void 0 ? 10 : _param$pageSize;
      this._on = flag;
      this._fetcher = fetcher;
      this._force = force;
      this._startPage = startPage;
      this._pageSize = pageSize;
    }
  }, {
    key: "stopFetch",
    value: function stopFetch() {
      if (this._destroyed) {
        this.destroyedErrorLog('stopFetch');
        return;
      }

      if (!this._on) {
        return;
      }

      if (this._stopKey) {
        (0, _Fetcher.stopFetchData)(this._stopKey);
        this._stopKey = null;
      }
    }
  }, {
    key: "fetch",
    value: function fetch(data) {
      var _this = this;

      if (this._destroyed) {
        this.destroyedErrorLog('fetch');
        return _Utils.udFun;
      }

      if (!this._on) {
        return _Utils.udFun;
      }

      if (!this._fetcher) {
        return _Utils.udFun;
      }

      this.stopFetch();
      var jsonData = JSON.stringify(data);

      if (!this._force && jsonData === this._jsonData) {
        return;
      }

      this._jsonData = jsonData;
      var stopKey = this._stopKey = (0, _Utils.createUid)('pageStopKey-'); // name, data = null, dataInfo = {}, stopKey = null

      return (0, _Fetcher.fetchData)(this._fetcher, data, {}, stopKey).then(function (result) {
        if (_this._destroyed) {
          return;
        }

        _this._count = result;

        _this._emitter.emit('$$data', {
          name: "$$count:".concat(_this.name),
          value: result
        });
      });
    }
  }, {
    key: "setPageInfo",
    value: function setPageInfo(pageSize, pageNumber) {
      if (this._destroyed) {
        this.destroyedErrorLog('setPageInfo');
        return;
      }

      if (!this._on) {
        return;
      }
    }
  }, {
    key: "getPageInfo",
    value: function getPageInfo() {
      if (this._destroyed) {
        this.destroyedErrorLog('getPageInfo');
        return {};
      }

      if (!this._on) {
        return {};
      }

      return {};
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this._destroyed = true;
      this._value = null;
      this._dh = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this.destroyedErrorLog = null;
      this._key = null;
    }
  }]);

  return PaginationManager;
}();

exports.default = PaginationManager;