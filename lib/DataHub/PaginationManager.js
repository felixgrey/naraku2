"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = _interopRequireDefault(require("./Fetcher"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PaginationManager =
/*#__PURE__*/
function () {
  function PaginationManager(dh, pgCfg) {
    _classCallCheck(this, PaginationManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this._fetchInfo = '';
    this._pgCfg = pgCfg;
    this._controller = dh._controller;
    this._emitter = _controller._emitter;
    var fetcher = pgCfg.fetcher,
        _pgCfg$count = pgCfg.count,
        count = _pgCfg$count === void 0 ? 0 : _pgCfg$count,
        _pgCfg$startPage = pgCfg.startPage,
        startPage = _pgCfg$startPage === void 0 ? 1 : _pgCfg$startPage,
        _pgCfg$currentPage = pgCfg.currentPage,
        currentPage = _pgCfg$currentPage === void 0 ? 1 : _pgCfg$currentPage,
        _pgCfg$pageSize = pgCfg.pageSize,
        pageSize = _pgCfg$pageSize === void 0 ? 10 : _pgCfg$pageSize;
    this._fetcher = fetcher;
    this._count = count;
    this._startPage = startPage;
    this._currentPage = currentPage;
    this._pageSize = pageSize;
    this.devLog = _Utils.udFun;
    this.errLog = _Utils.udFun;
  }

  _createClass(PaginationManager, [{
    key: "checkUpdate",
    value: function checkUpdate(data, dataInfo) {
      var fetchInfo = {
        data: (0, _Utils.snapshot)(data),
        dataInfo: (0, _Utils.snapshot)(dataInfo)
      };
      this._fetchInfo = fetchInfo;
    }
  }, {
    key: "setDataCount",
    value: function setDataCount(count) {
      this._count = count;
    }
  }, {
    key: "fetch",
    value: function fetch() {// name, data = null, dataInfo = {}, paginationManager = null, stopKey = null
      // TODO
    }
  }, {
    key: "changePage",
    value: function changePage(page) {
      this._currentPage = page;
    }
  }, {
    key: "changePageSize",
    value: function changePageSize(pageSize) {
      this._pageSize = pageSize;
    }
  }, {
    key: "getPaginationInfo",
    value: function getPaginationInfo() {
      return {
        isPagination: false,
        startPage: this._startPage,
        currentPage: this._currentPage
      };
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this._destroyed = false;
      this._controller = null;
    }
  }]);

  return PaginationManager;
}();

exports.default = PaginationManager;