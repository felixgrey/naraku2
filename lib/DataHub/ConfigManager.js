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

var ConfigManager =
/*#__PURE__*/
function () {
  function ConfigManager(dh) {
    var _this = this;

    _classCallCheck(this, ConfigManager);

    this._configNames = ['fetcher', 'clear', 'reset', 'snapshot', 'default'];
    this._configPolicy = {
      fetcher: function fetcher(dhName, typeValue, dhCfg) {
        var _dhCfg$dependence = dhCfg.dependence,
            dependence = _dhCfg$dependence === void 0 ? [] : _dhCfg$dependence,
            _dhCfg$filter = dhCfg.filter,
            filter = _dhCfg$filter === void 0 ? [] : _dhCfg$filter,
            _dhCfg$off = dhCfg.off,
            off = _dhCfg$off === void 0 ? false : _dhCfg$off,
            _dhCfg$pagination = dhCfg.pagination,
            pagination = _dhCfg$pagination === void 0 ? null : _dhCfg$pagination;
        dependence = [].concat(dependence);
        filter = [].concat(filter);
        var whenThem = [].concat(dependence).concat(filter);
        _this._switchStatus[dhName] = {
          off: off,
          willFetch: false
        };

        var checkReady = function checkReady() {
          var param = {};
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = dependence[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var dep = _step.value;

              if (!_this._dh.has(dep)) {
                return;
              }

              Object.assign(param, _this._controller.first(dep));
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

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = filter[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var ft = _step2.value;
              Object.assign(param, _this._controller.first(ft));
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

          if (_this._switchStatus[dhName].off) {
            _this._switchStatus[dhName].willFetch = true;
          } else {
            _this._controller.fetch(dhName, typeValue, param);
          }
        };

        _this._switchStatus[dhName].checkReady = checkReady;

        _this._controller.when(whenThem, checkReady);
      },
      clear: function clear(dhName, typeValue, dhCfg) {// TODO
      },
      reset: function reset(dhName, typeValue, dhCfg) {// TODO
      },
      snapshot: function snapshot(dhName, typeValue, dhCfg) {// TODO
      },
      default: function _default(dhName, typeValue, dhCfg) {// TODO
      }
    };
    this._key = (0, _Utils.getUniIndex)();
    this._dh = dh;
    this.extendConfig = dh.extendConfig;
    this._eternalData = dh._eternalData;
    this._controller = dh._controller;
    this._emitter = dh._controller._emitter;
    this._switchStatus = dh._controller._switchStatus;
    this._paginationData = dh._controller._paginationData;
    this._stopKeys = {};
    this._hasInit = false;
    this._destroyed = false;
    this.devLog = this._dh.devLog.createLog('ConfigManager');
    this.errLog = this._dh.errLog.createLog('ConfigManager');
    this.init();
  }

  _createClass(ConfigManager, [{
    key: "turnOn",
    value: function turnOn(dhName) {
      if (this._destroyed) {
        this.errLog("can't run 'turnOn' after configManager=".concat(this._key, " destroy."));
        return;
      }

      if (!this._switchStatus[dhName]) {
        this.errLog("can't turnOn ".concat(dhName, " if not existed."));
        return;
      }

      var _this$_switchStatus$d = this._switchStatus[dhName],
          willFetch = _this$_switchStatus$d.willFetch,
          checkReady = _this$_switchStatus$d.checkReady;
      this._switchStatus[dhName].off = false;

      if (willFetch) {
        this._switchStatus[dhName].willFetch = false;
        checkReady();
      }
    }
  }, {
    key: "turnOff",
    value: function turnOff(dhName) {
      if (this._destroyed) {
        this.errLog("can't run 'turnOff' after configManager=".concat(this._key, " destroy."));
        return;
      }

      if (!this._switchStatus[dhName]) {
        this.errLog("can't turnOff ".concat(dhName, " if not existed."));
        return;
      }

      this._switchStatus[dhName].off = true;
    }
  }, {
    key: "init",
    value: function init() {
      if (this._destroyed) {
        this.errLog("can't run 'init' after configManager=".concat(this._key, " destroy."));
        return;
      }

      if (this._hasInit === true) {
        return;
      }

      this._hasInit = true;
      var cfg = this._dh._config;
      this._name = cfg.$name || null;

      for (var dhName in cfg) {
        var dhCfg = cfg[dhName];

        if (/\_|\$/g.test(dhName.charAt(0))) {
          this.extendConfig[dhName] = dhCfg;
          continue;
        }

        this._eternalData.push(dhName);

        if (!dhCfg.hasOwnProperty('fetcher')) {
          if (dhCfg.hasOwnProperty('action')) {
            dhCfg.fetcher = dhCfg.action;
          } else if (dhCfg.hasOwnProperty('type')) {
            dhCfg.fetcher = dhCfg.type;
          }
        }

        if (Array.isArray(dhCfg)) {
          dhCfg = {
            default: dhCfg
          };
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this._configNames[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var configName = _step3.value;

            if (/\_|\$/g.test(configName.charAt(0))) {
              // MB-TODO
              continue;
            }

            if (dhCfg.hasOwnProperty(configName) && this._configPolicy[configName]) {
              this._configPolicy[configName].bind(this)(dhName, dhCfg[configName], dhCfg, cfg);
            }
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
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._destroyed) {
        return;
      }

      this._emitter.emit('$$destroy:configManager', this._key);

      this.devLog("configManager=".concat(this._key, " destroyed."));
      this._destroyed = true;
      this._controller = null;
      this._dh = null;
      this._emitter = null;
      this._switchStatus = null;
      this._paginationData = null;
      this._stopKeys = null;
      this._eternalData = null;
      this.devLog = null;
      this.errLog = null;
      this.extendConfig = null;
    }
  }]);

  return ConfigManager;
}();

exports.default = ConfigManager;