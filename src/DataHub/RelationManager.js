import {
	udFun,
	snapshot,
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
	initialization(...args){
		super.initialization(...args);
		
		const [dataStore] = args;
		
		this.name = dataStore.name;
		this.checkReady = udFun;
		this.defaultData = null;
		this.auto = true;
		
	}

	destruction() {
		super.destruction();
		
		this.offFetcher && this.offFetcher();
		this.offFetcher = null;

		this.checkReady = null;
		this.defaultData = null;
	}

	@publicMethod
	checkReady() {
		if (this.auto) {
			this.errLog(`can't checkReady when auto check.`);
			return;
		}
		this.checkReady(true);
	}

	@publicMethod
	turnOn(flag = false) {
		this.auto = true;
		if (flag) {
			this.checkReady(true);
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
					auto = true,
					force = false,
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

			this.dataStore.eternal = true;
			this.auto = auto;

			dependence = [].concat(dependence);
			filter = [].concat(filter);

			const whenThem = [].concat(dependence).concat(filter);

			const checkReady = (flag = false) => {
				if (!this.auto && !flag) {
					return;
				}
				
				this.devLog(`dependence checkReady`);
				const submitData = {};

				for (let dep of dependence) {
					const depStore = this.dataHub.getDataStore(dep);

					if (!depStore.hasData()) {
						if (this.dataStore.hasData()) {
							const param = {
								name: this.name,
								clear: true,
								force,
							};

							this.dataHubController.fetchManager.fetchStoreData(param);
						}
						return;
					}
					Object.assign(submitData, depStore.first());
				}

				for (let ft of filter) {
					Object.assign(submitData, this.dataHub.getDataStore(ft).first());
				}

				const param = {
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
					},
				};

				this.devLog(`fetch Data`, param);
				this.dataHubController.fetchManager.fetchStoreData(param);
			};

			this.devLog(`whenThem :`, whenThem);
			this.offFetcher = this.dataHubController.listenerManager.when(...whenThem, checkReady);
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

	configNames = ['default', 'clear', 'fetcher', 'reset', 'snapshot', 'stop'];
}

RelationManager.publicMethods = publicMethods;
