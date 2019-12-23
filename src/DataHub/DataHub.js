import {
	getUniIndex,
	udFun,
	isNvl,
	createDstroyedErrorLog,
} from './../Utils';

import Emitter from './Emitter';
import Controller from './Controller';
import ConfigManager from './ConfigManager';

const statusList = ['undefined', 'loading', 'locked', 'set', 'error'];
const dataOpMethods = [
	'set', 'get', 'remove', 'hasData',
	'setStatus', 'getStatus',
	'lock', 'unLock',
	'setError', 'getError'
];

export {
	dataOpMethods
}

export default class DataHub {

	constructor(config, devLog = udFun, errLog = udFun) {
		this._key = getUniIndex();

		this._config = config;

		this.devLog = devLog;
		this.errLog = errLog;

		// Emitter -> Controller -> 其它
		this._emitter = new Emitter();
		this._controller = new Controller(this);
		this._configManager = new ConfigManager(this);

		this._destroyed = false;

		this._data = {};
		this._status = {};
		this._lockStack = {};
		this._eternalData = [];
		this._errorMSg = {};

		this.extendData = {};
		this.extendConfig = {};
		this.dstroyedErrorLog = createDstroyedErrorLog('DataHub', this._key);

		this._emitter.on('$$status', ({
			name,
			value
		}) => {
			if (value !== 'error') {
				delete this._errorMSg[name];
			}
		});
	}

	getPublicFunction() {
		if (this._destroyed) {
			this.dstroyedErrorLog('getPublicFunction');
			return {};
		}
		return this._controller.publicFunction;
	}

	_initLockStack(name) {
		this._lockStack[name] = this._lockStack[name] || {
			old: null,
			stack: 0
		};
	}

	_isLocked(name) {
		this._initLockStack(name);
		return this._lockStack[name].stack > 0;
	}

	hasData(name) {
		return this._data[name] !== undefined;
	}

	set(name, value) {
		if (isNvl(name)) {
			return;
		}

		if (this._status[name] === 'loading') {
			this.errLog(`can't set ${name} when it is loading`);
			return;
		}

		if (this._isLocked(name)) {
			this.errLog(`can't set ${name} when it is locked`);
			return;
		}

		if (value === undefined) {
			value = [];
		}

		value = [].concat(value);

		this._data[name] = value;
		this._emitter.emit('$$data', {
			name,
			value
		});
		this._emitter.emit('$$data:' + name, value);
		this.setStatus(name, 'set');
	}

	get(name) {
		if (isNvl(name)) {
			return [];
		}

		return this._data[name] || [];
	}

	remove(name) {
		if (isNvl(name)) {
			return;
		}

		if (this._isLocked(name)) {
			this.errLog(`can't remove ${name} when it is locked.`);
			return;
		}

		if (this._eternalData.indexOf(name) !== -1) {
			this.errLog(`can't remove ${name} if it is eternal.`);
			return;
		}

		delete this._data[name];
		delete this._status[name];
		delete this._lockStack[name];

		this._emitter.emit('$$status', {
			name,
			value: 'undefined'
		});
		this._emitter.emit('$$status:' + name, 'undefined');

		this._emitter.emit('$$remove:' + name);
	}

	lock(name) {
		if (isNvl(name)) {
			return;
		}

		if (!this.hasData(name)) {
			return;
		}

		this._initLockStack(name);

		let oldStatus = this.getStatus(name);

		if (oldStatus !== 'locked') {
			this._lockStack[name].old = oldStatus;
			this._status[name] = 'locked';
			this._emitter.emit('$$status', {
				name,
				value: 'locked'
			});
			this._emitter.emit('$$status:' + name, 'locked');
		}

		this._lockStack[name].stack++;
	}

	unLock(name) {
		if (isNvl(name)) {
			return;
		}

		if (!this.hasData(name)) {
			return;
		}

		if (!this._isLocked(name)) {
			return;
		}

		this._lockStack[name].stack--;

		if (!this._lockStack[name].stack) {
			this._status[name] = this._lockStack[name].old;
			this._lockStack[name].old = null;
			this._emitter.emit('$$status', {
				name,
				value: this._status[name]
			});
			this._emitter.emit('$$status:' + name, this._status[name]);
		}
	}

	getError(name) {
		if (this._errorMSg.hasOwnProperty(name)) {
			return this._errorMSg[name];
		}
		return null;
	}

	setError(name, msg, value) {
		if (isNvl(name)) {
			return;
		}

		if (value === undefined) {
			value = [];
		}

		this._initLockStack(name);

		value = [].concat(value);

		this._lockStack[name].stack = 0;
		this._lockStack[name].old = null;
		this._data[name] = value;
		this._errorMSg[name] = msg;

		if (this.getStatus(name) !== 'error') {
			this._status[name] = 'error';
			this._emitter.emit('$$status', {
				name,
				value: 'error'
			});
			this._emitter.emit('$$status:' + name, 'error');
		}
	}

	setStatus(name, value) {
		if (isNvl(name)) {
			return;
		}

		if (value === 'locked') {
			this.errLog(`please use "dataHub.lock" to lock "${name}".`);
			return;
		}

		if (value === 'error') {
			this.errLog(`please use "dataHub.setError" to set error to "${name}".`);
			return;
		}

		if (!this.hasData(name)) {
			return;
		}

		if (this._isLocked(name)) {
			this.errLog(`can't set status ${name}=${value} when it is locked.`);
			return;
		}

		if (statusList.indexOf(value) === -1) {
			this.errLog(`${name} status must be one of "${statusList.join('","')}", but it is "${value}"`);
			return;
		}

		if (this.getStatus(name) !== value) {
			this._status[name] = value;
			this._emitter.emit('$$status', {
				name,
				value
			});
			this._emitter.emit('$$status:' + name, value);
		}
	}

	getStatus(name) {
		if (isNvl(name)) {
			return 'undefined';
		}

		return this._status[name] || 'undefined';
	}


	destroy() {
		if (this._destroyed) {
			return;
		}

		this._configManager.destroy();
		this._controller.destroy();

		this._emitter.emit('$$destroy:dataHub', this._key);
		this._emitter.destroy();

		this._destroyed = true;
		this._controller = null;
		this._emitter = null;

		this._config = null;
		this._data = null;
		this._status = null;
		this._lockStack = null;
		this._key = null;

		this.extendData = null;
		this.extendConfig = null;
		this._eternalData = null;
		this._errorMSg = null;
	}
}
