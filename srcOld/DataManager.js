import {
	isNvl,
	isBlank,
	udFun,
	getDeepValue,
	getUniIndex
} from './../Utils';

const publicMethods = [
	'get',
	'set',
	'clear',
	'hasData',
	'first',
	'getValue',
	'getStatus',
	'setStatus',
	'isLoading',
	'isLocked',
	'getError'
];

export default class DataManager {
	constructor() {
		this._key = getUniIndex();
		
	  this._controller = dhc;
	  this._dh = dhc._dh;
	  this._destroyed = false;

	  this._emitter = dhc._emitter;
		
	  this.devLog = dhc.devLog.createLog('DataManager');
	  this.errLog = dhc.errLog.createLog('DataManager');
	  
	  this.dstroyedErrorLog = createDestroyedErrorLog('DataManager', this._key);
		
		this._publicMethods = {};
		publicMethods.forEach(method => {
			this._publicMethods[method] = function(name, ...args) {
				if (this._destroyed) {
					this.dstroyedErrorLog(method);
					return udFun;
				}
				
				if (isBlank(name)) {
					return udFun;
				}
				
				return this[method](name, ...args);
			}.bind(this);
		});
	}
	
	getPublicMethods() {
		return {...this._publicMethods};
	}
	
	get(name) {
		return this._dh._data[name] || [];
	}
	
	set(name, value) {
		this._dh.set(name, value);
	}
	
	clear(name) {
		if (this._dh.hasData(name)) {
			this._dh.set(name, []);
		}
	}
	
	hasData(name) {
		return this._dh._data[name] !== undefined;
	}
	
	first(name, defaultValue) {
		return this.getValue(dhName + '.0', defaultValue);
	}
	
	getValue(fullPath, defaultValue) {
		const [name, ...pathArr] = fullPath.split('.');
		return getDeepValue(this.get(name), pathArr.join('.'), defaultValue);
	}
	
	getStatus(name) {
		return this._dh._status[name] || 'undefined';
	}
	
	setStatus(name, value, errMsg) {
		if (value === 'loading') {
			this._dh.setLoading(name);
			return;
		}
		
		if (value === 'loaded') {
			this._dh.clearLoading(name);
			return;
		}
		
		if (value === 'locked') {
			if (!this.hasData(name)) {
				return;
			}
			this._dh.lock(name);
			return;
		}
		
		if (value === 'unlock') {
			if (!this.hasData(name)) {
				return;
			}
			this._dh.unLock(name);
			return;
		}
		
		if (value === 'error') {
			this._dh.setError(name, errMsg);
			return;
		}
		
		this._dh.setStatus(name, value);
	}
	
	getError(name) {
		if (isNvl(this._dh._errorMSg[name]) ) {
			return null;
		}
		return this._dh._errorMSg[name];
	}
	
	_anyStatus(names, status) {
		names = [].concat(names);
		for (let _name of names) {
			if (this._dh.getStatus(_name) === status) {
				return true;
			}
		}
	
		return false;
	}
	
	isLoading(names) {
		this._anyStatus(names, 'loading');
	}
	
	isLocked(names) {
		this._anyStatus(names, 'locked');
	}
	
	destroy() {
		this._destroyed = true;
		this._controller = null;
		this._dh = null;
		this._emitter = null;
		this.devLog = null;
		this.errLog = null;	
		this.dstroyedErrorLog = null;
		this._publicMethods = null;
	}
}

DataManager.publicMethods = publicMethods;