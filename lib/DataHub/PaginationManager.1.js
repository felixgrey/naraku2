"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDefaultPageInfo = setDefaultPageInfo;
exports.default = void 0;

var _Utils = require("./../Utils");

var _Fetcher = require("./Fetcher");

var _Component2 = _interopRequireDefault(require("./Component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var defaultPageInfo = {
  force: false,
  page: 1,
  size: 10,
  start: 1
};
var publicMethod = _Component2.default.publicMethod;

function setDefaultPageInfo(v) {
  Object.assign(defaultPageInfo, v);
}

var PaginationManager =
/*#__PURE__*/
function (_Component) {
  _inherits(PaginationManager, _Component);

  function PaginationManager(store) {
    var _this;

    var _devMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, PaginationManager);

    _this._key = (0, _Utils.getUniIndex)();
    _this._clazz = _this.constructor.name;
    _this._logName = "".concat(_this._clazz, "=").concat(_this._key);
    _this._destroyed = false;
    _this._inited = false;
    _this._name = store._name;
    _this._fetcher = null;
    _this._stringData = '';
    _this._force = defaultPageInfo.force;
    _this._pageSize = defaultPageInfo.size;
    _this._pageNumber = defaultPageInfo.page;
    _this._startPage = defaultPageInfo.start;
    _this._stopKey = null;
    _this._noPage = false;
    _this._count = 0;
    _this._store = store;
    _this._dh = store._dh;
    _this._dhc = store._dh._dhc;
    _this._emitter = store._emitter; // console.log('----------------------', this._dh ,this._store._dh , this._store)

    _this.devLog = _devMode ? store.devLog.createLog(_this._logName) : _Utils.udFun;
    _this.errLog = store.errLog.createLog(_this._logName);
    _this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)(_this._clazz, _this._key);

    _this._emitter.once("$$destroy:".concat(store._clazz, ":").concat(store._key), function () {
      _this.devLog && _this.devLog("".concat(store._clazz, " destroyed => ").concat(_this._clazz, " destroy ."));

      _this.destroy();
    });

    _this.devLog("".concat(_this._logName, " created."));

    return _possibleConstructorReturn(_this);
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

      if ((0, _Utils.isNvl)(param) || param === false) {
        this._inited = true;
        this._noPage = true;
        return;
      }

      if (param === true) {
        param = {};
      }

      var _param = param,
          _param$fetcher = _param.fetcher,
          fetcher = _param$fetcher === void 0 ? null : _param$fetcher,
          _param$force = _param.force,
          force = _param$force === void 0 ? defaultPageInfo.force : _param$force,
          _param$startPage = _param.startPage,
          startPage = _param$startPage === void 0 ? defaultPageInfo.start : _param$startPage,
          _param$pageSize = _param.pageSize,
          pageSize = _param$pageSize === void 0 ? defaultPageInfo.size : _param$pageSize;
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

      if ((0, _Utils.isNvl)(data)) {
        data = {};
      }

      this.stopFetch();
      var stringData = null;

      if (typeof data.$uniStringify === 'function') {
        stringData = data.$uniStringify();
      } else {
        try {
          stringData = JSON.stringify(data);
        } catch (e) {
          this.devLog('stringData Error:', e);
        }
      }

      if (!(0, _Utils.isNvl)(stringData) && stringData === this._stringData) {
        this.devLog("same data", stringData);

        if (!this._force) {
          return;
        }

        this.devLog("same data but force fetch");
      }

      this._stringData = stringData;
      this.setPageInfo(1);
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
    value: function setPageInfo(pageNumber, pageSize) {
      if (this._hasErr('setPageInfo')) {
        return;
      }

      var changed = false;

      if (!(0, _Utils.isNvl)(pageNumber) && pageNumber !== this._pageNumber) {
        this._pageNumber = pageNumber;
        changed = true;
      }

      if (!(0, _Utils.isNvl)(pageSize) && pageSize !== this._pageSize) {
        this._pageSize = pageSize;
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
        return {};
      }

      if (this._noPage) {
        return {
          hasPagiNation: false
        };
      }

      return {
        hasPagiNation: true,
        count: this._count,
        page: this._pageNumber,
        size: this._pageSize,
        start: this._startPage
      };
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key);

      this._emitter.emit("$$destroy:".concat(this._clazz, "=").concat(this._key));

      this._destroyed = true;
      this._dh = null;
      this._emitter = null;
      this._fetcher = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return PaginationManager;
}(_Component2.default);

exports.default = PaginationManager;