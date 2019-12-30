"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component2 = _interopRequireDefault(require("./Component"));

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['turnOn', 'turnOff'];
var publicMethod = _Component2.default.publicMethod;
var RelationManager = (_class = (_temp =
/*#__PURE__*/
function (_Component) {
  _inherits(RelationManager, _Component);

  function RelationManager() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, RelationManager);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(RelationManager)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this._configPolicy = {
      default: function _default(value, cfg) {
        if (value === undefined) {
          value = [];
        }

        value = [].concat(value);
        _this._defaultData = value;

        _this._store.set((0, _Utils.snapshot)(value));
      },
      clear: function clear(value, cfg) {
        if (!_this._dhc._listenerManager) {
          _this.devLog("config clear err: no listenerManager");

          return;
        }

        _this._dhc._listenerManager.when(value, function () {
          _this._store.clear();
        });
      },
      reset: function reset(value, cfg) {
        if (!_this._dhc._listenerManager) {
          _this.devLog("config reset err: no listenerManager");

          return;
        }

        if (!_this._defaultData) {
          _this._dhc._listenerManager.when(value, function () {
            _this._store.clear();
          });
        } else {
          _this._dhc._listenerManager.when(value, function () {
            _this._store.set((0, _Utils.snapshot)(_this._defaultData));
          });
        }
      },
      snapshot: function snapshot(value, cfg) {
        if (!_this._dhc._listenerManager) {
          _this.devLog("config snapshot err: no listenerManager");

          return;
        }

        _this._dhc._listenerManager.when(value, function (data) {
          _this._store.set((0, _Utils.snapshot)(data));
        });
      },
      stop: function stop(value, cfg) {
        if (!_this._dhc._listenerManager || !_this._dhc._fetchManager) {
          _this.devLog("config stop err: no listenerManager/fetchManager", !!_this._dhc._fetchManager, !!_this._dhc._listenerManager);

          return;
        }

        _this._dhc._listenerManager.when(value, function (data) {
          _this._fetchManager.stopFetch(_this._name);
        });
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
    _this._configNames = ['default', 'clear', 'fetcher', 'reset', 'snapshot', 'stop'];
    return _this;
  }

  _createClass(RelationManager, [{
    key: "afterCreate",
    value: function afterCreate(store) {
      this._name = store._name;
      this._checkReady = _Utils.udFun;
      this._defaultData = null;
      this._switchStatus = {
        off: false,
        willFetch: false
      };
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      this._offFetcher && this._offFetcher();
      this._offFetcher = null;
      this._checkReady = null;
      this._defaultData = null;
      this._switchStatus = null;
    }
  }, {
    key: "turnOn",
    value: function turnOn() {
      this._switchStatus.off = false;

      if (this._switchStatus.willFetch) {
        this._switchStatus.willFetch = false;
        this._checkReady && this._checkReady();
      }
    }
  }, {
    key: "turnOff",
    value: function turnOff() {
      this._switchStatus.off = true;
    }
  }, {
    key: "init",
    value: function init() {
      var _this2 = this;

      var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this._configNames.forEach(function (cfgName) {
        var has1 = cfg.hasOwnProperty(cfgName);
        var has2 = _this2._configPolicy[cfgName];

        if (has1 && has2) {
          _this2._configPolicy[cfgName](cfg[cfgName], cfg);
        }
      });
    }
  }]);

  return RelationManager;
}(_Component2.default), _temp), (_applyDecoratedDescriptor(_class.prototype, "turnOn", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOn"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOff", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOff"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "init", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "init"), _class.prototype)), _class);
exports.default = RelationManager;
RelationManager.publicMethods = publicMethods;