import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

export default class ? {
	
	constructor(?, _devMode = false) {
	  this._key = getUniIndex();
	  this._destroyed = false;
		
		this._dhc = dhc;
		this._dh = dhc._dh;
		this._emitter = dhc._emitter;
		
		// TODO
		
		this._emitter.once(`$$destroy:Controller:${dhc._key}`, () => {
			this.destroy();
		});
		
		this.devLog = _devMode ? dh.devLog.createLog(`=${this._key}`) : udFun;
		this.errLog = dh.errLog.createLog(`=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('', this._key);
		
		this.devLog(`?=${this._key} created.`);
	}
	
	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this.devLog(`?=${this._key} destroyed.`);
		
		this._emitter.emit('$$destroy:'?, this._key);
		this._emitter.emit(`$$destroy::${this._key}`);
		
		// TODO

		this._destroyed = true;
		
		this._value = null;
		this._dh = null;
		this._emitter = null;
		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}