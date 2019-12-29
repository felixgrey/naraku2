"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var publicMethods = ['turnOn', 'turnOff'];

var RelationManager =
/*#__PURE__*/
function () {
  function RelationManager(dataStore) {
    var _this = this;

    var _devMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, RelationManager);

    this._configPolicy = {
      default: function _default(value, cfg) {
        if (value === undefined) {
          value = [];
        }

        value = [].concat(value);
        _this._defaultData = value;

        _this._store.set((0, _Utils.snapshot)(value));
      },
      fetcher: function fetcher(value, cfg) {
        var _this$_dhc$_listenerM;

        var _cfg$dependence = cfg.dependence,
            dependence = _cfg$dependence === void 0 ? [] : _cfg$dependence,
            _cfg$filter = cfg.filter,
            filter = _cfg$filter === void 0 ? [] : _cfg$filter,
            _cfg$off = cfg.off,
            off = _cfg$off === void 0 ? false : _cfg$off,
            _cfg$force = cfg.force,
            force = _cfg$force === void 0 ? false : _cfg$force;
        var ableFlag = _this._dh.getDataStore;
        ableFlag = ableFlag && _this._dhc._fetchManager;
        ableFlag = ableFlag && _this._dhc._listenerManager;

        if (!ableFlag) {
          _this.devLog("not able", !!_this._dh.getDataStore, !!_this._dhc._fetchManager, !!_this._dhc._listenerManager);

          return;
        }

        _this._store._eternal = true;
        _this._switchStatus.off = off;
        dependence = [].concat(dependence);
        filter = [].concat(filter);
        var whenThem = [].concat(dependence).concat(filter);

        var checkReady = function checkReady() {
          _this.devLog("dependence checkReady");

          var submitData = {};
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = dependence[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var dep = _step.value;

              var depStore = _this._dh.getDataStore(dep);

              if (!depStore.hasData()) {
                if (_this._store.hasData()) {
                  var _param = {
                    name: _this._name,
                    clear: true,
                    force: force
                  };

                  _this._dhc._fetchManager.fetchStoreData(_param);
                }

                return;
              }

              Object.assign(submitData, depStore.first());
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

          if (_this._switchStatus.off) {
            _this._switchStatus.willFetch = true;
            return;
          }

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = filter[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var ft = _step2.value;
              Object.assign(submitData, _this._dh.getDataStore(ft).first());
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

          var param = {
            name: _this._name,
            data: submitData,
            clear: false,
            force: force,
            before: function before() {
              whenThem.forEach(function (storeName) {
                _this._dh.getDataStore(storeName).lock();
              });
            },
            after: function after() {
              whenThem.forEach(function (storeName) {
                _this._dh.getDataStore(storeName).unLock();
              });
            }
          };

          _this.devLog("fetch Data", param);

          _this._dhc._fetchManager.fetchStoreData(param);
        };

        _this.devLog("whenThem :", whenThem);

        _this._offFetcher = (_this$_dhc$_listenerM = _this._dhc._listenerManager).when.apply(_this$_dhc$_listenerM, _toConsumableArray(whenThem).concat([checkReady]));
        _this._checkReady = checkReady;
        checkReady();
      }
    };
    this._configNames = ['fetcher', 'clear', 'reset', 'snapshot', 'default'];
    this._key = (0, _Utils.getUniIndex)();
    this._clazz = this.constructor.name;
    this._logName = "".concat(this._clazz, "=").concat(this._key);
    this._destroyed = false;
    this._store = dataStore;
    this._dh = dataStore._dh;
    this._dhc = this._dh._dhc;
    this._emitter = dataStore._emitter;
    this._name = dataStore._name;
    this._checkReady = _Utils.udFun;
    this._defaultData = null;
    this._switchStatus = {
      off: false,
      willFetch: false
    };
    this.devLog = _devMode ? dataStore.devLog.createLog(this._logName) : _Utils.udFun;
    this.errLog = dataStore.errLog.createLog(this._logName);
    this.destroyedErrorLog = (0, _Utils.createDestroyedErrorLog)(this._clazz, this._key);

    this._emitter.once("$$destroy:".concat(this._dh._clazz, ":").concat(this._dh._key), function () {
      _this.devLog && _this.devLog("".concat(_this._clazz, " destroyed => ").concat(_this._clazz, " destroy ."));

      _this.destroy();
    });

    this.devLog("".concat(this._logName, " created."));
  }

  _createClass(RelationManager, [{
    key: "_hasErr",
    value: function _hasErr(name) {
      if (this._destroyed) {
        this.devLog("run '".concat(name, "' failed : "), this._destroyed);
        return true;
      }

      return false;
    }
  }, {
    key: "turnOn",
    value: function turnOn() {
      if (this._hasErr()) {
        return;
      }

      this._switchStatus.off = false;

      if (this._switchStatus.willFetch) {
        this._switchStatus.willFetch = false;
        this._checkReady && this._checkReady();
      }
    }
  }, {
    key: "turnOff",
    value: function turnOff() {
      if (this._hasErr()) {
        return;
      }

      this._switchStatus.off = true;
    }
  }, {
    key: "init",
    value: function init() {
      var _this2 = this;

      var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this._hasErr()) {
        return;
      }

      this._configNames.forEach(function (cfgName) {
        var has1 = cfg.hasOwnProperty(cfgName);
        var has2 = _this2._configPolicy[cfgName];

        if (has1 && has2) {
          _this2._configPolicy[cfgName](cfg[cfgName], cfg);
        }
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this.devLog("".concat(this._logName, " destroyed."));

      this._emitter.emit("$$destroy:".concat(this._clazz), this._key);

      this._emitter.emit("$$destroy:".concat(this._clazz, ":").concat(this._key));

      this._offFetcher && this._offFetcher();
      this._offFetcher = null;
      this._destroyed = true;
      this._checkReady = null;
      this._defaultData = null;
      this._dh = null;
      this._dhc = null;
      this._emitter = null;
      this.devLog = null;
      this.errLog = null;
      this._key = null;
    }
  }]);

  return RelationManager;
}();

exports.default = RelationManager;
RelationManager.publicMethods = publicMethods;