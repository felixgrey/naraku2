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
  function PaginationManager(store) {
    var _this = this;

    var _devMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, PaginationManager);

    this._key = (0, _Utils.getUniIndex)();
    this._destroyed = false;
    this._inited = false;
    this._name = store._name;
    this._fetcher = null;
    this._jsonData = '';
    this._force = false;
    this._pageSize = 10;
    this._pageNumber = 1;
    this._startPage = 1;
    this._stopKey = null;
    this._count = 0;
    this._store = store;
    this._dh = store._dh;
    this._emitter = store._emitter; // console.log('----------------------', this._dh ,this._store._dh , this._store)

    this._emitter.once("$$destroy:DataHub:".concat(this._dh._key), function () {
      _this.destroy();
    });

    this.devLog = _devMode ? store.devLog.createLog("PaginationManager=".concat(this._key)) : _Utils.udFun;
    this.errLog = store.errLog.createLog("PaginationManager=".concat(this._key));
    this.devLog("PaginationManager=".concat(this._key, " created."));
  }

  _createClass(PaginationManager, [{
    key: "_hasErr",
    value: function _hasErr(name) {
      if (this._destroyed || !this._inited || !this._fetcher) {
        this.devLog("run '".concat(name, "' failed : "), this._destroyed, this._inited, this._fetcher);
        return true;
      }

      return false;
    }
  }, {
    key: "init",
    value: function init(param) {
      if (this._destroyed) {
        this.devLog("can't run init after destroyed");
        return;
      }

      if ((0, _Utils.isNvl)(param)) {
        this._inited = true;
        return;
      }

      var _param$fetcher = param.fetcher,
          fetcher = _param$fetcher === void 0 ? null : _param$fetcher,
          _param$force = param.force,
          force = _param$force === void 0 ? false : _param$force,
          _param$startPage = param.startPage,
          startPage = _param$startPage === void 0 ? 1 : _param$startPage,
          _param$pageSize = param.pageSize,
          pageSize = _param$pageSize === void 0 ? 10 : _param$pageSize;
      this._inited = true;
      this._fetcher = fetcher;
      this._force = force;
      this._startPage = startPage;
      this._pageSize = pageSize;
    }
  }, {
    key: "setCount",
    value: function setCount(v) {
      if (this._hasErr('setCount')) {
        return;
      }

      this._count = v;
    }
  }, {
    key: "getCount",
    value: function getCount() {
      if (this._hasErr('getCount')) {
        return;
      }

      return this._count;
    }
  }, {
    key: "stopFetch",
    value: function stopFetch() {
      if (this._hasErr('stopFetch')) {
        return;
      }

      if (this._stopKey) {
        (0, _Fetcher.stopFetchData)(this._stopKey);
        this._stopKey = null;
      }
    }
  }, {
    key: "fetch",
    value: function fetch() {
      var _this2 = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this._hasErr('fetch')) {
        return;
      }

      this.stopFetch();

      try {
        var jsonData = JSON.stringify(data);

        if (jsonData === this._jsonData) {
          this.devLog("same data", jsonData);

          if (!this._force) {
            return;
          }

          this.devLog("same data but force fetch");
        }

        this._jsonData = jsonData;
      } catch (e) {
        this.devLog('jsonData Error:', e);
      }

      var stopKey = this._stopKey = (0, _Utils.createUid)('pageStopKey-'); // name, data = null, dataInfo = {}, stopKey = null

      return (0, _Fetcher.fetchData)(this._fetcher, data, {
        name: this._name,
        pagination: true
      }, stopKey).then(function (result) {
        if (_this2._destroyed) {
          return;
        }

        _this2.devLog('result is ', result);

        if (isNaN(+result)) {
          _this2.errLog('data count must be Number, but it is: ', result);

          result = 0;
        }

        _this2._count = +result;

        _this2.devLog("'".concat(_this2._name, "' count is ").concat(_this2._count));

        _this2._emitter.emit('$$data', {
          name: "$$count:".concat(_this2._name),
          value: result
        });
      }).catch(function (err) {
        if (err === _Fetcher.NOT_INIT_FETCHER) {
          _this2.devLog('must init fetcher first');

          return;
        }

        if (err === _Fetcher.NOT_ADD_FETCH) {
          _this2.devLog("must add fetcher '".concat(_this2._fetcher, "' first"));

          return;
        }

        if (err === _Fetcher.ABORT_REQUEST) {
          return;
        }

        return Promise.reject(err);
      });
    }
  }, {
    key: "setPageInfo",
    value: function setPageInfo(pageSize, pageNumber) {
      if (this._hasErr('setPageInfo')) {
        return;
      }

      var changed = false;

      if (!(0, _Utils.isNvl)(pageSize) && pageSize !== this._pageSize) {
        this._pageSize = pageSize;
        changed = true;
      }

      if (!(0, _Utils.isNvl)(pageNumber) && pageNumber !== this._pageNumber) {
        this._pageNumber = pageNumber;
        changed = true;
      }

      if (changed) {
        this._emitter.emit('$$data', {
          name: "$$page:".concat(this._name)
        });
      }
    }
  }, {
    key: "getPageInfo",
    value: function getPageInfo() {
      if (this._hasErr('getPageInfo')) {
        return;
      }

      return {
        count: this._count
      };
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("PaginationManager=".concat(this._key, " destroyed."));

      this._emitter.emit('$$destroy:PaginationManager', this._key);

      this._emitter.emit("$$destroy:PaginationManager:".concat(this._key));

      this._destroyed = true;
      this._dh = null;
      this._emitter = null;
      this._fetcher = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return PaginationManager;
}();

exports.default = PaginationManager;