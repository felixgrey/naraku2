import {
	isNvl,
	getUniIndex,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

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

const allStatus = [
	'undefined',
	'ready',
	'loading',
	'locked',
	'error'
];

export default class DataStore {
	constructor(dh, name, eternal = false, _devMode = false) {
		this._key = getUniIndex();
		this._name = name;
		this._eternal = eternal;
		this._destroyed = false;

		this._dh = dh;
		this._emitter = dh._emitter;

		this._value = [];
		this._storeConfig = {};

		this._oldStatus = 'undefined';
		this._status = 'undefined';
		this._lockStack = 0;
		this._errMsg = null;

		dh._emitter.once('$$destroy:DataHub', () => {
			this.destroy();
		});

		this.devLog = _devMode ? this._dh.devLog.createLog('DataStore:' + name) : udFun;
		this.errLog = this._dh.errLog.createLog('DataStore:' + name);
		this.destroyedErrorLog = createDestroyedErrorLog('DataStore', name);

		this.devLog(`DataStore=${this._key} created.`);
	}

	setEternal(flag) {
		this._eternal = flag;
	}

	setConfig(cfg) {
		this._storeConfig = cfg;
	}

	getStoreConfig() {
		return this._storeConfig;
	}

	_setStatus(status) {
		if (status === this._status) {
			return;
		}

		this.devLog(`changeStatus :${this._status} => ${status}`);

		this._oldStatus = this._status;
		this._status = status;

		this._emitter.emit('$$status', {
			name: this._name,
			value: this._status
		});

		this._emitter.emit(`$$status:${this._name}:${this._status}`);
	}

	_emitDataChange() {
		this._emitter.emit('$$data', {
			name: this._name,
			value: this._value
		});

		this._emitter.emit(`$$data:${this._name}`, this._value);
	}

	set(value) {
		if (this._status === 'locked' || this._status === 'loading') {
			this.errLog(`can't set value when '${this._name}' is locked or loading.`);
			return;
		}

		if (value === undefined) {
			value = [];
		}

		value = [].concat(value);
		this._value = value;
		this._errMsg = null;
		
		this.devLog(`run set`, value);

		this._emitDataChange();
		this._setStatus('ready');
	}

	merge0(data) {
		const value = Object.assign({}, this.first(), data);
		if (this.isEmpty()) {
			this.set(value);
		} else {
			this._value[0] = value;
			this._emitDataChange();
		}
	}

	first(defaultValue = {}) {
		return this.getValue('0', defaultValue);
	}

	getValue(path, defaultValue) {
		return getDeepValue(this._value, path, defaultValue);
	}

	get() {
		return this._value;
	}

	clear() {
		if (this._status === 'undefined') {
			return;
		}

		if (this._status === 'locked' || this._status === 'loading') {
			this.errLog(`can't clear when '${this._name}' is locked or loading.`);
			return;
		}

		this.set([]);
	}

	isEmpty() {
		return this.getCount() === 0;
	}

	getCount() {
		return this._value.length;
	}

	getStatus() {
		return this._status;
	}

	remove() {
		if (this._eternal) {
			this.errLog(`can't remove eternal dataStore '${this._name}'.`);
			return;
		}

		if (this._status === 'locked' || this._status === 'loading') {
			this.errLog(`can't remove when '${this._name}' is locked or loading.`);
			return;
		}

		this._value = [];
		this._oldStatus = 'undefined';

		this._emitDataChange();
		this._setStatus('undefined');
	}

	isLocked() {
		return this._status === 'locked';
	}

	isLoading() {
		return this._status === 'loading';
	}

	setErrorMsg(msg) {
		if (isNvl(msg)) {
			this.errLog(`can't set null error message to '${this._name}'.`);
			return;
		}
		this._errMsg = msg;
		this._setStatus('error');
	}

	getErrorMsg() {
		return this._errMsg;
	}

	lock() {
		this._lockStack++;
		this._setStatus('locked');
	}

	unLock() {
		if (this._lockStack > 0) {
			this._lockStack--;
		}

		this.devLog(`unLock: lockStack=${this._lockStack}, oldStatus=${this._oldStatus}`);
		if (this._lockStack === 0) {
			this._setStatus(this._oldStatus);
		}
	}

	unLockAll() {
		this._lockStack = 0;
		this.unLock();
	}

	loading() {
		this.devLog(`loading: status=${this._status}`);

		if (this._status === 'locked' || this._status === 'loading') {
			this.errLog(`can't set status=loading when '${this._name}' is locked or loading.`);
			return;
		}

		this._setStatus('loading');
	}

	clearLoading() {
		if (this._status === 'loading') {
			this._setStatus(this._oldStatus);
		}
	}

	loaded(value) {
		if (this._status !== 'loading') {
			this.errLog(`'${this._name}' isn't loading.`);
			return;
		}

		if (this._status === 'locked') {
			this.errLog(`can't set status=${this._oldStatus} when '${this._name}' is locked.`);
			return;
		}

		this.clearLoading();
		this.set(value);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`DataStore=${this._key} destroy`);

		this._emitter.emit('$$destroy:DataStore', this._key);
		this._emitter.emit(`$$destroy:DataStore:${this._key}`);

		this._destroyed = true;

		this._value = null;
		this._storeConfig = null;

		this._dh = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}

DataStore.publicMethods = publicMethods;
DataStore.allStatus = allStatus;
