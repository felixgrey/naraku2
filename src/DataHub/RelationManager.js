import {
  udFun,
  snapshot,
  isNvl,
  mergeObject,
} from './../Utils';

import Component from './Component';

const publicMethods = [
  'turnOn',
  'turnOff',
  'isAuto',
  'checkReady',
];

const {
  publicMethod
} = Component;

export default class RelationManager extends Component {
  initialization(...args) {
    super.initialization(...args);

    const [dataStore] = args;

    this.name = dataStore.name;
    this.storeName = dataStore.storeName;

    this.checkReady = udFun;
    this.defaultData = null;
    this.auto = true;
    this.willFetch = false;

  }

  destruction() {
    super.destruction();

    this.offFetcher && this.offFetcher();
    this.offFetcher = null;

    this.offGlobal && this.offGlobal();
    this.offGlobal = null;

    this.checkReady = null;
    this.defaultData = null;
  }

  @publicMethod
  checkReady() {}

  @publicMethod
  turnOn(flag = false) {
    if (this.auto === true) {
      return;
    }

    this.auto = true;
    if (this.willFetch && flag) {
      this.checkReady();
    }
  }

  @publicMethod
  turnOff() {
    this.auto = false;
  }

  @publicMethod
  isAuto() {
    return this.auto;
  }

  configPolicy = {
    default: (value, cfg) => {
      if (value === undefined) {
        value = [];
      }
      value = [].concat(value);

      this.defaultData = value;
      this.dataStore.set(snapshot(value));
    },
    global: (value = null, cfg) => {
      if (value === null) {
        return;
      }

      const dataHub = this.dataHubController.dataHub;

      if (!dataHub) {
        this.devLog(`config global err: no dataHub`);
        return;
      }

      this.offGlobal = dataHub.constructor.when(value, (data) => {
        this.dataStore.set(snapshot(data));
      });
    },
    clear: (value, cfg) => {
      if (!this.dataHubController.listenerManager) {
        this.devLog(`config clear err: no listenerManager`);
        return;
      }

      this.dataHubController.listenerManager.when(value, () => {
        this.dataStore.clear();
      });
    },
    reset: (value, cfg) => {
      if (!this.dataHubController.listenerManager) {
        this.devLog(`config reset err: no listenerManager`);
        return;
      }

      if (!this.defaultData) {
        this.dataHubController.listenerManager.when(value, () => {
          this.dataStore.clear();
        });
      } else {
        this.dataHubController.listenerManager.when(value, () => {
          this.dataStore.set(snapshot(this.defaultData));
        });
      }
    },
    snapshot: (value, cfg) => {
      if (!this.dataHubController.listenerManager) {
        this.devLog(`config snapshot err: no listenerManager`);
        return;
      }

      this.dataHubController.listenerManager.when(value, (data) => {
        this.dataStore.set(snapshot(data));
      });
    },
    stop: (value, cfg) => {
      if (!this.dataHubController.listenerManager || !this.dataHubController.fetchManager) {
        this.devLog(`config stop err: no listenerManager/fetchManager`,
          !!this.dataHubController.fetchManager,
          !!this.dataHubController.listenerManager
        );
        return;
      }

      this.dataHubController.listenerManager.when(value, (data) => {
        this.fetchManager.stopFetch(this.name);
      });
    },
    fetcher: (value, cfg) => {
      let {
        dependence = [],
          filter = [],
          auto,
          force = false,
          staticParam = {},
      } = cfg;


      let ableFlag = this.dataHub.getDataStore;
      ableFlag = ableFlag && this.dataHubController.fetchManager;
      ableFlag = ableFlag && this.dataHubController.listenerManager;

      if (!ableFlag) {
        this.devLog(`not able`,
          !!this.dataHub.getDataStore,
          !!this.dataHubController.fetchManager,
          !!this.dataHubController.listenerManager
        );
        return;
      }

      if (isNvl(auto)) {
        const $auto = this.dataHub.cfg.$auto;
        auto = isNvl($auto) ? true : $auto;
      }

      this.dataStore.eternal = true;
      this.auto = auto;

      dependence = [].concat(dependence);
      filter = [].concat(filter);

      const onThem = [].concat(dependence).concat(filter);

      const checkReady = () => {
        if (this.destroyed) {
          return;
        }

        this.devLog(`dependence checkReady`);

        let submitData = {
          ...staticParam
        };

        for (let dep of dependence) {
          const depStore = this.dataHub.getDataStore(dep);

          if (!depStore.get().length) {
            if (this.dataStore.hasSet()) {
              const param = {
                name: this.name,
                clear: true,
                force,
              };

              this.dataHubController.fetchManager.fetchStoreData(param);
            }
            return;
          }

          submitData = mergeObject(submitData, depStore.first());
        }

        for (let ft of filter) {
          submitData = mergeObject(submitData, this.dataHub.getDataStore(ft).first());
        }

        const param = {
          name: this.name,
          data: submitData,
          clear: false,
          force,
          before: () => {
            if (this.destroyed) {
              return;
            }

            onThem.forEach(storeName => {
              (!force) && this.dataHub.getDataStore(storeName).lock();
            });
          },
          after: () => {
            if (this.destroyed) {
              return;
            }

            onThem.forEach(storeName => {
              (!force) && this.dataHub.getDataStore(storeName).unLock();
            });
          },
        };

        this.devLog(`checkReady@${this.logName}, auto=${this.auto}`, param);
        if (!this.auto) {
          this.willFetch = true;
          return;
        }
        this.willFetch = false;

        this.devLog(`fetch Data`, param);
        this.dataHubController.fetchManager.fetchStoreData(param);
      };

      this.devLog(`onThem:`, onThem);

      const offs = onThem.map(onStore => {
        const storeName = this.dataHub.getDataStore(onStore).storeName;
        return this.dataHubController.listenerManager.on('$$data:' + storeName, checkReady);
      });

      offs.push(this.dataHubController.listenerManager.on('$$page:' + this.storeName, checkReady));

      this.offFetcher = () => {
        offs.forEach(off => off());
      }

      this.checkReady = checkReady;
      checkReady();
    }
  }

  @publicMethod
  init(cfg = {}) {
    this.configNames.forEach(cfgName => {
      const has1 = cfg.hasOwnProperty(cfgName);
      const has2 = this.configPolicy[cfgName];

      if (has1 && has2) {
        this.configPolicy[cfgName](cfg[cfgName], cfg);
      }
    });
  }

  configNames = ['default', 'clear', 'fetcher', 'reset', 'snapshot', 'stop', 'global'];
}

RelationManager.publicMethods = publicMethods;
