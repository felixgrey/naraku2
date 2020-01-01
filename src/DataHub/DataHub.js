import {
	udFun,
} from './../Utils';

import Emitter from './Emitter';
import DataStore from './DataStore';
import Controller from './Controller';
import Component from './Component';

const {
	publicMethod
} = Component;

export default class DataHub extends Component {

	constructor(cfg, devLog = udFun, errLog = udFun, _devMode = false) {
		super({
			devLog,
			errLog
		}, cfg, _devMode);
	}

	afterCreate(dh, cfg) {
		this._cfg = cfg || {};
		this._dh = this;

		this._emitter = new Emitter(this.devLog, this.errLog, this._devMode);
		this._dhc = new Controller(this, this._devMode);

		this._dataCenter = {};
		this._extendConfig = {};

		this._initDsPublicMethods();
		this._init();
	}

	beforeDestroy() {
		Object.values(this._dataCenter).forEach(ds => ds.destroy());
		this._dataCenter = null;

		this._dhc.destroy();
		this._dhc = null;
	}

	destroy() {
		const _emitter = this._emitter;
		super.destroy();
		_emitter.destroy();
	}

	_init() {
		for (let name in this._cfg) {
			if (/\_|\$/g.test(name.charAt(0))) {
				this._extendConfig[name] = this._cfg[name];
				continue;
			}
			this.getDataStore(name).setConfig(this._cfg[name]);
		}
	}

	_initDsPublicMethods() {
		DataStore.publicMethods.forEach(methodName => {
			this[methodName] = (name, ...args) => {
				if (this._destroyed) {
					this.destroyedErrorLog(methodName);
					return udFun;
				}

				return this.getDataStore(name)[methodName](...args);
			}
		});
	}

	@publicMethod
	getDataStore(name) {
		if (!this._dataCenter[name]) {
			this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, this._devMode);
		}
		return this._dataCenter[name];
	}

	@publicMethod
	getController() {
		if (this._destroyed) {
			this.destroyedErrorLog('getController');
			return udFun;
		}

		return this._dhc.getPublicMethods();
	}
}

const globalDataHub = new DataHub({}, udFun, udFun, false);
const globalMethods = globalDataHub.getController();

DataHub.globalDataHub = globalDataHub;
Object.keys(globalMethods).forEach(method => {
	DataHub[method] = (...args) => globalMethods[method](...args);
});

