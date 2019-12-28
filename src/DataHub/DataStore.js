import {
	isNvl,
	getUniIndex,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import PaginationManager from './PaginationManager.js';

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
		this._pagination = new PaginationManager(dh, name, _devMode);

		this._oldStatus = 'undefined';
		this._status = 'undefined';
		this._lockStack = 0;
		this._errMsg = null;

		dh._emitter.once(`$$destroy:DataHub:${dh._key}`, () => {
			this.devLog && this.devLog(`DataHub destroyed .`);
			this.destroy();
		});

		let logName = `DataStore=${this._key}@${name}`;

		this.devLog = _devMode ? this._dh.devLog.createLog(logName) : udFun;
		this.errLog = this._dh.errLog.createLog(logName);
		this.destroyedErrorLog = createDestroyedErrorLog('DataStore', this._key);

		this.devLog(`DataStore=${this._key} created.`);
	}

	_hasErr(name) {
		if (this._destroyed) {
			this.devLog(`run '${name}' failed : `, this._destroyed);
			return true;
		}

		return false;
	}

	getPaginationManager() {
		if (this._hasErr()) {
			return;
		}

		return this._pagination;
	}

	setEternal(flag) {
		if (this._hasErr()) {
			return;
		}

		this._eternal = flag;
	}

	setConfig(cfg = {}) {
		if (this._hasErr()) {
			return;
		}

		const {
			pagination = null
		} = cfg;

		if (typeof pagination === 'object') {
			this._pagination.init(pagination);
		}

		this._storeConfig = cfg;
	}

	getStoreConfig() {
		if (this._hasErr()) {
			return {};
		}

		return this._storeConfig;
	}

	_setStatus(status) {
		if (this._hasErr()) {
			return;
		}

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
		if (this._hasErr()) {
			return;
		}

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

		this._setStatus('ready');
		this._emitDataChange();
	}

	merge0(data) {
		if (this._hasErr()) {
			return;
		}

		if (this._status === 'locked' || this._status === 'loading') {
			this.errLog(`can't set merge0 when '${this._name}' is locked or loading.`);
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

	first(defaultValue = {}) {
		if (this._hasErr()) {
			return defaultValue;
		}

		return this.getValue('0', defaultValue);
	}

	getValue(path, defaultValue) {
		if (this._hasErr()) {
			return false;
		}

		return getDeepValue(this._value, path, defaultValue);
	}

	hasData() {
		if (this._hasErr()) {
			return false;
		}

		return this.getStatus() !== 'undefined';
	}

	get() {
		if (this._hasErr()) {
			return [];
		}

		return this._value;
	}

	clear() {
		if (this._hasErr()) {
			return;
		}

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
		if (this._hasErr()) {
			return false;
		}

		return this.getCount() === 0;
	}

	getCount() {
		if (this._hasErr()) {
			return 0;
		}

		return this._value.length;
	}

	getStatus() {
		if (this._hasErr()) {
			return 'undefined';
		}

		return this._status;
	}

	remove() {
		if (this._hasErr()) {
			return;
		}

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

		this._setStatus('undefined');
		this._emitDataChange();
	}

	isLocked() {
		if (this._hasErr()) {
			return false;
		}

		return this._status === 'locked';
	}

	isLoading() {
		if (this._hasErr()) {
			return false;
		}

		return this._status === 'loading';
	}

	setErrorMsg(msg) {
		if (this._hasErr()) {
			return false;
		}

		if (isNvl(msg)) {
			this.errLog(`can't set null error message to '${this._name}'.`);
			return;
		}

		this._errMsg = msg;
		this._setStatus('error');
	}

	getErrorMsg() {
		if (this._hasErr()) {
			return null;
		}

		return this._errMsg;
	}

	lock() {
		if (this._hasErr()) {
			return;
		}

		this._lockStack++;
		this._setStatus('locked');
	}

	unLock() {
		if (this._hasErr()) {
			return;
		}

		if (this._lockStack > 0) {
			this._lockStack--;
		}

		this.devLog(`unLock: lockStack=${this._lockStack}, oldStatus=${this._oldStatus}`);
		if (this._lockStack === 0) {
			this._setStatus(this._oldStatus);
		}
	}

	unLockAll() {
		if (this._hasErr()) {
			return;
		}

		this._lockStack = 0;
		this.unLock();
	}

	loading() {
		if (this._hasErr()) {
			return;
		}

		this.devLog(`loading: status=${this._status}`);

		if (this._status === 'locked' || this._status === 'loading') {
			this.errLog(`can't set status=loading when '${this._name}' is locked or loading.`);
			return;
		}

		this._setStatus('loading');
	}

	clearLoading() {
		if (this._hasErr()) {
			return;
		}

		if (this._status === 'loading') {
			this._setStatus(this._oldStatus);
		}
	}

	loaded(value) {
		if (this._hasErr()) {
			return;
		}

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

		this.devLog(`DataStore=${this._key} destroy.`);

		this._emitter.emit('$$destroy:DataStore', this._key);
		this._emitter.emit(`$$destroy:DataStore:${this._key}`);

		this._pagination.destroy();
		this._pagination = null;

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
