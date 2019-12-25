"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultPagination = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var defaultPagination = {
  fetcher: null,
  size: 10,
  start: 1
};
exports.defaultPagination = defaultPagination;

var PaginationManager =
/*#__PURE__*/
function () {
  function PaginationManager(pageChange, dh, pgCfg) {
    _classCallCheck(this, PaginationManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this.dstroyedErrorLog = (0, _Utils.createDstroyedErrorLog)('PaginationManager', this._key);
    this._pageChange = pageChange;
    this._jsonData = '';
    this._pgCfg = Object.assign({}, defaultPagination, pgCfg);
    this._currentPage = this._pgCfg.start;
    this._count = 0;
    this._dhName = this._pgCfg.dhName;
    this._dh = dh;
    this._emitter = dh._emitter;
    this._controller = dh._controller;
    var fetcher = this._pgCfg.fetcher;

    if (!(0, _Utils.isNvl)(fetcher)) {
      if (typeof fetcher === 'string') {
        this._fetcher = (0, _Fetcher.getFetcher)(fetcher);
      } else {
        this._fetcher = fetcher;
      }
    }

    this.devLog = _Utils.udFun;
    this.errLog = _Utils.udFun;
  }

  _createClass(PaginationManager, [{
    key: "setLogger",
    value: function setLogger() {
      var devLog = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
      var errLog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.udFun;
      this.devLog = devLog;
      this.errLog = errLog;
    }
  }, {
    key: "stopFetch",
    value: function stopFetch() {
      if (this._destroyed) {
        this.dstroyedErrorLog('stopFetch');
        return;
      }

      if (this.pageStopKey) {
        (0, _Fetcher.stopFetchData)(this.pageStopKey);
        this.pageStopKey = null;
      }
    }
  }, {
    key: "fetch",
    value: function fetch(data) {
      if (this._destroyed) {
        this.dstroyedErrorLog('fetch');
        return;
      } // this.devLog(data)


      var jsonData = JSON.stringify(data);

      if (!this._fetcher || this._jsonData === jsonData) {
        return Promise.resolve();
      }

      this._jsonData = jsonData;
      this.pageStopKey = (0, _Utils.createUid)('pageStopKey_');
      this._count = 0;
      return (0, _Fetcher.fetchData)(this._fetcher, data, {}, this, this.pageStopKey);
    }
  }, {
    key: "changePageInfo",
    value: function changePageInfo(page, pageSize) {
      if (this._destroyed) {
        this.dstroyedErrorLog('changePageInfo');
        return;
      }

      if (this._dh.getStatus(this._dhName) === 'loading') {
        this.errLog("can't changePageInfo when ".concat(this._dhName, " is loading."));
        return;
      }

      var changed = false;

      if (!(0, _Utils.isNvl)(page) && this._currentPage !== page) {
        this._currentPage = page;
        changed = true;
      }

      if (!(0, _Utils.isNvl)(pageSize) && this._pageSize !== pageSize) {
        this._pageSize = pageSize;
        changed = true;
      }

      if (changed) {
        this._emitter.emit(this._pageChange);
      }
    }
  }, {
    key: "setDataCount",
    value: function setDataCount(count) {
      if (this._destroyed) {
        this.dstroyedErrorLog('setDataCount');
        return;
      }

      this._count = count;

      this._emitter.emit('$$data', {
        name: '$$count',
        value: count
      });
    }
  }, {
    key: "getPaginationInfo",
    value: function getPaginationInfo(url) {
      if (this._destroyed) {
        this.dstroyedErrorLog('getPaginationInfo');
        return {};
      }

      return {
        isPagination: this._fetcher && url && this._fetcher.url === url,
        size: this._pgCfg.size,
        start: this._pgCfg.start,
        count: this._count,
        page: this._currentPage
      };
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.pageStopKey && (0, _Fetcher.stopFetchData)(this.pageStopKey);

      this._emitter.emit('$$destroy:PaginationManager', this._key);

      this._destroyed = true;
      this._controller = null;
      this._emitter = null;
    }
  }]);

  return PaginationManager;
}();

exports.default = PaginationManager;