"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component = _interopRequireDefault(require("./Component"));

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['turnOn', 'turnOff', 'isAuto', 'checkReady'];
var {
  publicMethod
} = _Component.default;
var RelationManager = (_class = (_temp = class RelationManager extends _Component.default {
  constructor() {
    var _this;

    super(...arguments);
    _this = this;
    this._configPolicy = {
      default: (value, cfg) => {
        if (value === undefined) {
          value = [];
        }

        value = [].concat(value);
        this._defaultData = value;

        this._store.set((0, _Utils.snapshot)(value));
      },
      clear: (value, cfg) => {
        if (!this._dhc._listenerManager) {
          this.devLog("config clear err: no listenerManager");
          return;
        }

        this._dhc._listenerManager.when(value, () => {
          this._store.clear();
        });
      },
      reset: (value, cfg) => {
        if (!this._dhc._listenerManager) {
          this.devLog("config reset err: no listenerManager");
          return;
        }

        if (!this._defaultData) {
          this._dhc._listenerManager.when(value, () => {
            this._store.clear();
          });
        } else {
          this._dhc._listenerManager.when(value, () => {
            this._store.set((0, _Utils.snapshot)(this._defaultData));
          });
        }
      },
      snapshot: (value, cfg) => {
        if (!this._dhc._listenerManager) {
          this.devLog("config snapshot err: no listenerManager");
          return;
        }

        this._dhc._listenerManager.when(value, data => {
          this._store.set((0, _Utils.snapshot)(data));
        });
      },
      stop: (value, cfg) => {
        if (!this._dhc._listenerManager || !this._dhc._fetchManager) {
          this.devLog("config stop err: no listenerManager/fetchManager", !!this._dhc._fetchManager, !!this._dhc._listenerManager);
          return;
        }

        this._dhc._listenerManager.when(value, data => {
          this._fetchManager.stopFetch(this._name);
        });
      },
      fetcher: (value, cfg) => {
        var {
          dependence = [],
          filter = [],
          auto = true,
          force = false
        } = cfg;
        var ableFlag = this._dh.getDataStore;
        ableFlag = ableFlag && this._dhc._fetchManager;
        ableFlag = ableFlag && this._dhc._listenerManager;

        if (!ableFlag) {
          this.devLog("not able", !!this._dh.getDataStore, !!this._dhc._fetchManager, !!this._dhc._listenerManager);
          return;
        }

        this._store._eternal = true;
        this._auto = auto;
        dependence = [].concat(dependence);
        filter = [].concat(filter);
        var whenThem = [].concat(dependence).concat(filter);

        var checkReady = function checkReady() {
          var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          if (!_this._auto && !flag) {
            return;
          }

          _this.devLog("dependence checkReady");

          var submitData = {};

          for (var dep of dependence) {
            var depStore = _this._dh.getDataStore(dep);

            if (!depStore.hasData()) {
              if (_this._store.hasData()) {
                var _param = {
                  name: _this._name,
                  clear: true,
                  force
                };

                _this._dhc._fetchManager.fetchStoreData(_param);
              }

              return;
            }

            Object.assign(submitData, depStore.first());
          }

          for (var ft of filter) {
            Object.assign(submitData, _this._dh.getDataStore(ft).first());
          }

          var param = {
            name: _this._name,
            data: submitData,
            clear: false,
            force,
            before: () => {
              whenThem.forEach(storeName => {
                _this._dh.getDataStore(storeName).lock();
              });
            },
            after: () => {
              whenThem.forEach(storeName => {
                _this._dh.getDataStore(storeName).unLock();
              });
            }
          };

          _this.devLog("fetch Data", param);

          _this._dhc._fetchManager.fetchStoreData(param);
        };

        this.devLog("whenThem :", whenThem);
        this._offFetcher = this._dhc._listenerManager.when(...whenThem, checkReady);
        this._checkReady = checkReady;
        checkReady();
      }
    };
    this._configNames = ['default', 'clear', 'fetcher', 'reset', 'snapshot', 'stop'];
  }

  afterCreate(store) {
    this._name = store._name;
    this._checkReady = _Utils.udFun;
    this._defaultData = null;
    this._auto = true;
  }

  beforeDestroy() {
    this._offFetcher && this._offFetcher();
    this._offFetcher = null;
    this._checkReady = null;
    this._defaultData = null;
  }

  checkReady() {
    if (this._auto) {
      this.errLog("can't checkReady when auto check.");
      return;
    }

    this._checkReady(true);
  }

  turnOn() {
    var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    this._auto = true;

    if (flag) {
      this._checkReady(true);
    }
  }

  turnOff() {
    this._auto = false;
  }

  isAuto() {
    return this._auto;
  }

  init() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this._configNames.forEach(cfgName => {
      var has1 = cfg.hasOwnProperty(cfgName);
      var has2 = this._configPolicy[cfgName];

      if (has1 && has2) {
        this._configPolicy[cfgName](cfg[cfgName], cfg);
      }
    });
  }

}, _temp), (_applyDecoratedDescriptor(_class.prototype, "checkReady", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "checkReady"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOn", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOn"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOff", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOff"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isAuto", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isAuto"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "init", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "init"), _class.prototype)), _class);
exports.default = RelationManager;
RelationManager.publicMethods = publicMethods;