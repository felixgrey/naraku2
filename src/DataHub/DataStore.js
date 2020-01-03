import {
	isNvl,
	getDeepValue,
	snapshot,
	udFun
} from './../Utils';

import Component from './Component';

import PaginationManager from './PaginationManager.js';
import RelationManager from './RelationManager.js';

const {
	publicMethod
} = Component;

const allStatus = [
	'undefined',
	'ready',
	'loading',
	'locked',
	'error'
];

const publicMethods = [
	'set',
	'merge0',
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

export default class DataStore extends Component {

	afterCreate(dh, name) {
		this._store = this;
		this._eternal = false;
		this._value = [];
		this._storeConfig = null;
		this._extendConfig = {};
		this._oldStatus = 'undefined';
		this._status = 'undefined';
		this._lockStack = 0;
		this._errMsg = null;
		this._name = name;

    this._pagination = new PaginationManager(this, this._devMode);
    this._relationManager = new RelationManager(this, this._devMode);

    this.publicMethods(RelationManager.publicMethods, '_relationManager');

	}

	beforeDestroy() {
		this._pagination.destroy();
		this._pagination = null;

		this._relationManager.destroy();
		this._relationManager = null;

		this._value = null;
		this._storeConfig = null;
		this._extendConfig = null
	}

	getPaginationManager() {
		if (this._destroyed) {
			return udFun;
		}
		return this._pagination;
	}

	@publicMethod
	getPageInfo() {
		return this._pagination.getPageInfo();
	}

	@publicMethod
	setConfig(cfg) {
		if (this._storeConfig) {
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
				this._extendConfig[name] = value;
				return;
			}
		});

		this._relationManager.init(cfg);
		this._pagination.init(cfg.pagination);

		this._storeConfig = cfg;
	}

	@publicMethod
	getExtendConfig() {
		return {
			...
			this._extendConfig
		};
	}

	@publicMethod
	getStoreConfig() {
		return { ...(this._storeConfig || {})
		};
	}

	_setStatus(status) {
		if (status === this._status) {
			return;
		}

		this.devLog(`changeStatus :${this._status} => ${status}`);
		if (this._status !== 'locked' && this._status !== 'loading') {
			this._oldStatus = this._status;
		}
		this._status = status;

		this._emitter.emit('$$status', {
			name: this._name,
			value: this._status
		});

		this._emitter.emit(`$$status:${this._name}@${this._status}`);
	}

	_emitDataChange() {
		this._emitter.emit('$$data', {
			name: this._name,
			value: this._value
		});

		this._emitter.emit(`$$data:${this._name}`, this._value);
	}

	@publicMethod
	set(value) {
		if (this._status === 'locked' || this._status === 'loading') {
			this.methodErrLog('set', value, 'locked/loading',
				`can't set value when '${this._name}' is locked or loading.`);
			return;
		}

		if (value === undefined) {
			value = [];
		}

		value = [].concat(value);
		this._value = value;
		this._errMsg = null;

		this._setStatus('ready');
		this._emitDataChange();
	}

	@publicMethod
	merge0(data) {
		if (this._status === 'locked' || this._status === 'loading') {
			this.methodErrLog('merge0', [data], 'locked/loading',
				`can't set merge0 when '${this._name}' is locked or loading.`);
			return;
		}

		const value = Object.assign({}, this.first(), data);
		if (this.isEmpty()) {
			this.set(value);
		} else {
			this._value[0] = value;
			this.set(this._value);;
		}
	}

	@publicMethod
	first(defaultValue = {}) {
		return this.getValue('0', defaultValue);
	}

	@publicMethod
	getValue(path, defaultValue) {
		return getDeepValue(this._value, path, defaultValue);
	}

	@publicMethod
	hasData() {
		return this.getStatus() !== 'undefined';
	}

	@publicMethod
	get() {
		return this._value;
	}

	@publicMethod
	clear() {
		if (this._status === 'undefined') {
			return;
		}

		if (this._status === 'locked' || this._status === 'loading') {
			this.methodErrLog('clear', [], 'locked/loading',
				`can't clear when '${this._name}' is locked or loading.`);
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
		return this._value.length;
	}

	@publicMethod
	getStatus() {
		return this._status;
	}

	@publicMethod
	remove() {
		if (this._eternal) {
			this.methodErrLog('remove', [], 'eternal',
				`can't remove eternal dataStore '${this._name}'.`);
			return;
		}

		if (this._status === 'locked' || this._status === 'loading') {
			this.methodErrLog('remove', [], 'locked/loading',
				`can't remove when '${this._name}' is locked or loading.`);
			return;
		}

		this._value = [];
		this._oldStatus = 'undefined';

		this._setStatus('undefined');
		this._emitDataChange();
	}

	@publicMethod
	isLocked() {
		return this._status === 'locked';
	}

	@publicMethod
	isLoading() {
		return this._status === 'loading';
	}

	@publicMethod
	setErrorMsg(msg) {
		if (isNvl(msg)) {
			this.methodErrLog('setErrorMsg', [msg], 'null',
				`can't set null error message to '${this._name}'.`);
			return;
		}

		this._errMsg = msg;
		this._setStatus('error');
	}

	@publicMethod
	getErrorMsg() {
		return this._errMsg;
	}

	@publicMethod
	lock() {
		if (this._status === 'loading') {
			this.methodErrLog('lock', [], 'loading',
				`can't lock  when '${this._name}' is loading.`);
			return;
		}

		this._lockStack++;
		this._setStatus('locked');
	}

	@publicMethod
	unLock() {
		if (this._lockStack > 0) {
			this._lockStack--;
		}

		this.devLog(`unLock: lockStack=${this._lockStack}, oldStatus=${this._oldStatus}`);
		if (this._lockStack === 0) {
			this._setStatus(this._oldStatus);
		}
	}

	@publicMethod
	unLockAll() {
		this._lockStack = 0;
		this.unLock();
	}

	@publicMethod
	loading() {
		this.devLog(`loading: status=${this._status}`);

		if (this._status === 'locked' || this._status === 'loading') {
			this.methodErrLog('loading', [], 'locked/loading',
				`can't set status=loading when '${this._name}' is locked or loading.`);
			return;
		}

		this._setStatus('loading');
	}

	@publicMethod
	clearLoading() {
		if (this._status === 'loading') {
			this._setStatus(this._oldStatus);
		}
	}

	@publicMethod
	loaded(value) {
		if (this._status !== 'loading') {
			this.methodErrLog('loaded', [value], 'locked/loading', `'${this._name}' isn't loading.`);
			return;
		}

		if (this._status === 'locked') {
			this.methodErrLog('loaded', [value], 'locked/loading',
				`can't set status=${this._oldStatus} when '${this._name}' is locked.`);
			return;
		}

		this.clearLoading();
		this.set(value);
	}
}

DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;
