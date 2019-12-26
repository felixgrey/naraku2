import {
	getUniIndex,
	udFun,
	isNvl,
	createDestroyedErrorLog,
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
		this._destroyed = false;
		this._config = config || {};

		this.devLog = devLog;
		this.errLog = errLog;

		// 需要放在ConfigManager之前
		this._eternalData = [];
		this._data = {};
		this._status = {};
		this._oldStatus = {};
		this._lockStack = {};
		this._errorMSg = {};

		this.extendData = {};
		this.extendConfig = {};

		// Emitter -> Controller -> 其它
		this._emitter = new Emitter();
		this._controller = new Controller(this);
		this._configManager = new ConfigManager(this);

		this.dstroyedErrorLog = createDestroyedErrorLog('DataHub', this._key);

		this._emitter.on('$$status', ({
			name,
			value
		}) => {
			if (value !== 'error') {
				delete this._errorMSg[name];
			}
		});
	}
	
	initData(name) {
		if (!this._dataInfo[name]) {
			this._dataInfo[name] = {
				data: null,
				old: 'undefined',
				current: 'undefined',
				locked: 0
			}
		}
	}

	getController() {
		if (this._destroyed) {
			this.dstroyedErrorLog('getController');
			return {};
		}
		return this._controller.getPublicMethods();
	}

	hasData(name) {
		return this._data[name] !== undefined;
	}

	set(name, value) {
		if (/\_|\$/g.test(name.charAt(0))) {
			this.errLog(`${name} can't be start with $ or _`);
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

	remove(name) {
		this._initLockStack(name);
		
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
		delete this._oldStatus[name];
		delete this._lockStack[name];

		this._emitter.emit('$$status', {
			name,
			value: 'undefined'
		});
		this._emitter.emit('$$status:' + name, 'undefined');

		this._emitter.emit('$$remove:' + name);
	}

	lock(name) {
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
		this._initLockStack(name);
		
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

	setError(name, value, msg) {
		this._initLockStack(name);
		
		if (value === undefined) {
			value = [];
		}
		value = [].concat(value);


		this._lockStack[name].stack = 0;
		this._lockStack[name].old = null;
		this._data[name] = value;
		this._errorMSg[name] = msg;
		
		this.setStatus(name, 'error');
	}
	
	setLoading(name) {
		this._initLockStack(name);
		
		if (this._isLocked(name)) {
			this.errLog(`can't set status ${name}=loading when it is locked.`);
			return;
		}
		
		this._lockStack[name].old = this.this._status[name] || 'undefined';
		
	}

	setStatus(name, value, errMsg) {
		this._initLockStack(name);
		
		if (this._isLocked(name)) {
			this.errLog(`can't set status ${name}=${value} when it is locked.`);
			return;
		}

		if (value === 'loading') {
			this._oldStatus[name] = this.getStatus(name);
			// this.devLog('this._oldStatus', this._oldStatus[name], typeof this._oldStatus[name])
		}

		if (value === 'clearLoading') {
			value = this._oldStatus[name] || 'undefined';
			delete this._oldStatus[name];
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
		this._oldStatus = null;
		this._lockStack = null;
		this._key = null;

		this.extendData = null;
		this.extendConfig = null;
		this._eternalData = null;
		this._errorMSg = null;
	}
}
