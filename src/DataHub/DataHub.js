import {
	udFun,
} from './../Utils';

import Emitter from './Emitter';
import Container from './Container';
import DataStore from './DataStore';

// import Controller from './Controller';
// import RelationManager from './RelationManager';

const {
	publicMethod
} = Container;

export default class DataHub extends Container {

	initialization(...args) {
		super.initialization(...args);

		const [cfg] = args;

		this.cfg = cfg || {};
		this.dataHub = this;

		this.emitter = new Emitter(this.union);

		// this.dataHubController = new Controller(this, this.union);

		this.dataCenter = {};

		this.initDsPublicMethods();
		this.init();

	}

	destruction() {
		super.destruction();
		
		Object.values(this.dataCenter).forEach(ds => ds.destroy());
		this.dataCenter = null;

		this.dataHubController && this.dataHubController.destroy();
		this.dataHubController = null;

	}

	destroy() {
		const emitter = this.emitter;
		super.destroy();
		emitter.destroy();
	}

	init() {
		for (let name in this.cfg) {
			if (/\_|\$/g.test(name.charAt(0))) {
				this.setData(name, this.cfg[name]);
				continue;
			}
			this.getDataStore(name).setConfig(this.cfg[name]);
		}
	}

	initDsPublicMethods() {

		[]
		// .concat(RelationManager.publicMethods)
		.concat(DataStore.publicMethods)
			.forEach(methodName => {
				this[methodName] = (name, ...args) => {
					if (this.destroyed) {
						this.destroyedErrorLog(methodName);
						return udFun;
					}

					return this.getDataStore(name)[methodName](...args);
				}
			});
	}

	@publicMethod
	getDataStore(name) {
		this.devLog('getDataStore', name);
		if (!this.dataCenter[name]) {
			this.dataCenter[name] = new DataStore(this, name, this.union);
		}
		return this.dataCenter[name];
	}

	@publicMethod
	getController() {
		if (!this.dataHubController) {
			return udFun;
		}

		return this.dataHubController.getPublicMethods();
	}
}

const globalDataHub = new DataHub({}, udFun, udFun, false);
const globalMethods = globalDataHub.getController();

DataHub.globalDataHub = globalDataHub;
Object.keys(globalMethods).forEach(method => {
	DataHub[method] = (...args) => globalMethods[method](...args);
});

export {
	DataHub
}
