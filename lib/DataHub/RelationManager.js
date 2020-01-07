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
    super(...arguments);
    this.configPolicy = {
      default: (value, cfg) => {
        if (value === undefined) {
          value = [];
        }

        value = [].concat(value);
        this.defaultData = value;
        this.dataStore.set((0, _Utils.snapshot)(value));
      },
      clear: (value, cfg) => {
        if (!this.dataHubController.listenerManager) {
          this.devLog("config clear err: no listenerManager");
          return;
        }

        this.dataHubController.listenerManager.when(value, () => {
          this.dataStore.clear();
        });
      },
      reset: (value, cfg) => {
        if (!this.dataHubController.listenerManager) {
          this.devLog("config reset err: no listenerManager");
          return;
        }

        if (!this.defaultData) {
          this.dataHubController.listenerManager.when(value, () => {
            this.dataStore.clear();
          });
        } else {
          this.dataHubController.listenerManager.when(value, () => {
            this.dataStore.set((0, _Utils.snapshot)(this.defaultData));
          });
        }
      },
      snapshot: (value, cfg) => {
        if (!this.dataHubController.listenerManager) {
          this.devLog("config snapshot err: no listenerManager");
          return;
        }

        this.dataHubController.listenerManager.when(value, data => {
          this.dataStore.set((0, _Utils.snapshot)(data));
        });
      },
      stop: (value, cfg) => {
        if (!this.dataHubController.listenerManager || !this.dataHubController.fetchManager) {
          this.devLog("config stop err: no listenerManager/fetchManager", !!this.dataHubController.fetchManager, !!this.dataHubController.listenerManager);
          return;
        }

        this.dataHubController.listenerManager.when(value, data => {
          this.fetchManager.stopFetch(this.name);
        });
      },
      fetcher: (value, cfg) => {
        var {
          dependence = [],
          filter = [],
          auto = true,
          force = false
        } = cfg;
        var ableFlag = this.dataHub.getDataStore;
        ableFlag = ableFlag && this.dataHubController.fetchManager;
        ableFlag = ableFlag && this.dataHubController.listenerManager;

        if (!ableFlag) {
          this.devLog("not able", !!this.dataHub.getDataStore, !!this.dataHubController.fetchManager, !!this.dataHubController.listenerManager);
          return;
        }

        this.dataStore.eternal = true;
        this.auto = auto;
        dependence = [].concat(dependence);
        filter = [].concat(filter);
        var whenThem = [].concat(dependence).concat(filter);

        var checkReady = () => {
          this.devLog("dependence checkReady");
          var submitData = {};

          for (var dep of dependence) {
            var depStore = this.dataHub.getDataStore(dep);

            if (!depStore.hasSet()) {
              if (this.dataStore.hasSet()) {
                var _param = {
                  name: this.name,
                  clear: true,
                  force
                };
                this.dataHubController.fetchManager.fetchStoreData(_param);
              }

              return;
            }

            Object.assign(submitData, depStore.first());
          }

          for (var ft of filter) {
            Object.assign(submitData, this.dataHub.getDataStore(ft).first());
          }

          var param = {
            name: this.name,
            data: submitData,
            clear: false,
            force,
            before: () => {
              whenThem.forEach(storeName => {
                this.dataHub.getDataStore(storeName).lock();
              });
            },
            after: () => {
              whenThem.forEach(storeName => {
                this.dataHub.getDataStore(storeName).unLock();
              });
            }
          };

          if (!this.auto) {
            this.willFetch = true;
            return;
          }

          this.willFetch = false;
          this.devLog("fetch Data", param);
          this.dataHubController.fetchManager.fetchStoreData(param);
        };

        this.devLog("whenThem :", whenThem);
        this.offFetcher = this.dataHubController.listenerManager.when(...whenThem, checkReady);
        this.checkReady = checkReady;
        checkReady();
      }
    };
    this.configNames = ['default', 'clear', 'fetcher', 'reset', 'snapshot', 'stop'];
  }

  initialization() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    super.initialization(...args);
    var [dataStore] = args;
    this.name = dataStore.name;
    this.checkReady = _Utils.udFun;
    this.defaultData = null;
    this.auto = true;
    this.willFetch = false;
  }

  destruction() {
    super.destruction();
    this.offFetcher && this.offFetcher();
    this.offFetcher = null;
    this.checkReady = null;
    this.defaultData = null;
  }

  checkReady() {
    if (this.auto) {
      this.errLog("can't checkReady when auto check.");
      return;
    }

    this.checkReady();
  }

  turnOn() {
    var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (this.auto === true) {
      return;
    }

    this.auto = true;

    if (this.willFetch && flag) {
      this.checkReady();
    }
  }

  turnOff() {
    this.auto = false;
  }

  isAuto() {
    return this.auto;
  }

  init() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.configNames.forEach(cfgName => {
      var has1 = cfg.hasOwnProperty(cfgName);
      var has2 = this.configPolicy[cfgName];

      if (has1 && has2) {
        this.configPolicy[cfgName](cfg[cfgName], cfg);
      }
    });
  }

}, _temp), (_applyDecoratedDescriptor(_class.prototype, "checkReady", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "checkReady"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOn", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOn"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "turnOff", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "turnOff"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isAuto", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isAuto"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "init", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "init"), _class.prototype)), _class);
exports.default = RelationManager;
RelationManager.publicMethods = publicMethods;