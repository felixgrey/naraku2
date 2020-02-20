import {
	isNvl,
	getDeepValue,
} from './../Utils';

import Container from './Container';
import Component from './Component';

import PaginationManager from './PaginationManager.js';
import RelationManager from './RelationManager.js';

const {
	publicMethod
} = Container;

const allStatus = [
	'undefined',
	'ready',
	'loading',
	'locked',
	'error'
];

const publicMethods = [
	'set',
	'merge',
	'first',
	'getValue',
	'get',
	'clear',
	'isEmpty',
	'getCount',
	'getStatus',
	'remove',
	'setErrorMsg',
	'getErrorMsg',
	'lock',
	'unLock',
  'loading',
	'clearLoading',
	'loaded'
];

export default class DataStore extends Container {

	initialization(...args) {
		super.initialization(...args);

		const [dataHub, name] = args;

		this.dataHub = dataHub;
		this.dataHubController = dataHub.dataHubController;

		this.store = this;
		this.eternal = false;
		this.value = [];
		this.storeConfig = null;
		this.oldStatus = 'undefined';
		this.status = 'undefined';
		this.lockStack = 0;
		this.errMsg = null;

		if (isNvl(name)) {
			this.errLog('DataStore must has name.');
			return;
		}
		this.name = name;

		this.paginationManager = new PaginationManager(this, this.union);
		this.relationManager = new RelationManager(this, this.union);
		this.publicMethods(RelationManager.publicMethods, 'relationManager');

		this.containerDestroyOff = Component.prototype.bindContainer.bind(this)(dataHub);

	}

	bindContainer(instance) {
		super.bindContainer(instance);

		instance.dataHub = this.dataHub;
		instance.dataHubController = this.dataHub.dataHubController;
		instance.dataStore = this;
	}

	destruction() {
		super.destruction();

		this.paginationManager && this.paginationManager.destroy();
		this.paginationManager = null;

		this.relationManager && this.relationManager.destroy();
		this.relationManager = null;

		this.containerDestroyOff();
		this.containerDestroyOff = null;

		this.value = null;
		this.storeConfig = null;
	}

	@publicMethod
	getPageInfo() {
		if (!this.paginationManager) {
			return {};
		}
		return this.paginationManager.getPageInfo();
	}

	@publicMethod
	setConfig(cfg) {
		if (this.storeConfig) {
			this.devLog(`run setConfig again`);
			return;
		}

		if (cfg === undefined) {
			cfg = {
				default: []
			};
		} else if (cfg === null) {
			cfg = {
				default: [null]
			};
		} else if (typeof cfg !== 'object') {
			cfg = {
				default: [cfg]
			};
		} else if (Array.isArray(cfg)) {
			cfg = {
				default: cfg
			};
		};

		Object.keys(cfg).forEach(name => {
			let value = cfg[name];
			if (/\_|\$/g.test(name.charAt(0))) {
				this.setData(name, value);
				return;
			}
		});

		this.relationManager && this.relationManager.init(cfg);
		this.paginationManager && this.paginationManager.init(cfg.pagination);

		this.storeConfig = cfg;
	}

	@publicMethod
	getExtendConfig() {
		return {
			...this.data
		};
	}

	@publicMethod
	getStoreConfig() {
		return { ...(this.storeConfig || {})
		};
	}

	setStatus(status) {
		if (status === this.status) {
			return;
		}

		this.devLog(`changeStatus :${this.status} => ${status}`);
		if (this.status !== 'locked' && this.status !== 'loading') {
			this.oldStatus = this.status;
		}
		this.status = status;

		this.emitter.emit('$$status', {
			name: this.name,
			value: this.status
		});

		this.emitter.emit(`$$status:${this.name}=${this.status}`);

    this.emitter.emit('$$model', {
      src: this,
      type: '$$status',
    	name: this.name,
    	value: this.value
    });
	}

	emitDataChange() {
		this.emitter.emit('$$data', {
			name: this.name,
			value: this.value
		});

		this.emitter.emit(`$$data:${this.name}`, this.value);

    this.emitter.emit('$$model', {
      src: this,
      type: '$$data',
    	name: this.name,
    	value: this.value
    });
	}

	@publicMethod
	set(value) {
		if (this.status === 'locked' || this.status === 'loading') {
			this.methodErrLog('set', value, 'locked/loading',
				`can't set value when '${this.name}' is locked or loading.`);
			return;
		}

		if (value === undefined) {
			value = [];
		}

		value = [].concat(value);
		this.value = value;
		this.errMsg = null;

		this.setStatus('ready');
		this.emitDataChange();
	}

	@publicMethod
	merge(data, index = 0) {
		if (this.status === 'locked' || this.status === 'loading') {
			this.methodErrLog('merge', [data], 'locked/loading',
				`can't set merge0 when '${this.name}' is locked or loading.`);
			return;
		}

		const value = Object.assign({}, (this.value || [])[index], data);
		if (this.isEmpty()) {
			this.set(value);
		} else {
			this.value[index] = value;
			this.set(this.value);;
		}

    return value;
	}

	@publicMethod
	first(defaultValue = {}) {
		return this.getValue('0', defaultValue);
	}

	@publicMethod
	getValue(path, defaultValue) {
		return getDeepValue(this.value, path, defaultValue);
	}

	@publicMethod
	hasSet() {
		return this.getStatus() !== 'undefined';
	}

	@publicMethod
	get() {
		return this.value;
	}

	@publicMethod
	clear() {
		if (this.status === 'undefined') {
			return;
		}

		if (this.status === 'locked' || this.status === 'loading') {
			this.methodErrLog('clear', [], 'locked/loading',
				`can't clear when '${this.name}' is locked or loading.`);
			return;
		}

		this.set([]);
	}

	@publicMethod
	isEmpty() {
		return this.getCount() === 0;
	}

	@publicMethod
	getCount() {
		return this.value.length;
	}

	@publicMethod
	getStatus() {
		return this.status;
	}

	@publicMethod
	remove() {
		if (this.eternal) {
			this.methodErrLog('remove', [], 'eternal',
				`can't remove eternal dataStore '${this.name}'.`);
			return;
		}

		if (this.status === 'locked' || this.status === 'loading') {
			this.methodErrLog('remove', [], 'locked/loading',
				`can't remove when '${this.name}' is locked or loading.`);
			return;
		}

		this.value = [];
		this.oldStatus = 'undefined';

		this.setStatus('undefined');
		this.emitDataChange();
	}

	@publicMethod
	isLocked() {
		return this.status === 'locked';
	}

	@publicMethod
	isLoading() {
		return this.status === 'loading';
	}
  
  @publicMethod
  hasError() {
  	return this.status === 'error';
  }

	@publicMethod
	setErrorMsg(msg) {
		if (isNvl(msg)) {
			this.methodErrLog('setErrorMsg', [msg], 'null',
				`can't set null error message to '${this.name}'.`);
			return;
		}

		this.errMsg = msg;
		this.setStatus('error');
	}

	@publicMethod
	getErrorMsg() {
		return this.errMsg;
	}

	@publicMethod
	lock() {
		if (this.status === 'loading') {
			this.methodErrLog('lock', [], 'loading',
				`can't lock  when '${this.name}' is loading.`);
			return;
		}

		this.lockStack++;
		this.setStatus('locked');
	}

	@publicMethod
	unLock() {
		if (this.lockStack > 0) {
			this.lockStack--;
		}

		this.devLog(`unLock: lockStack=${this.lockStack}, oldStatus=${this.oldStatus}`);
		if (this.lockStack === 0) {
			this.setStatus(this.oldStatus);
		}
	}

	@publicMethod
	unLockAll() {
		this.lockStack = 0;
		this.unLock();
	}

	@publicMethod
	loading() {
		this.devLog(`loading: status=${this.status}`);

		if (this.status === 'locked' || this.status === 'loading') {
			this.methodErrLog('loading', [], 'locked/loading',
				`can't set status=loading when '${this.name}' is locked or loading.`);
			return;
		}

		this.setStatus('loading');
	}

	@publicMethod
	clearLoading() {
		if (this.status === 'loading') {
			this.setStatus(this.oldStatus);
		}
	}

	@publicMethod
	loaded(value) {
		if (this.status !== 'loading') {
			this.methodErrLog('loaded', [value], 'locked/loading', `'${this.name}' isn't loading.`);
			return;
		}

		if (this.status === 'locked') {
			this.methodErrLog('loaded', [value], 'locked/loading',
				`can't set status=${this.oldStatus} when '${this.name}' is locked.`);
			return;
		}

		this.clearLoading();
		this.set(value);
	}
}

DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;
