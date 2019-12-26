import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

export default class PaginationManager {
	
	constructor( _devMode = false) {
	  this._key = getUniIndex();
	  this._destroyed = false;
		
		this._offOnDestroy = dh._emitter.once('$$destroy:DataHub', () => {
			this.destroy();
		});
		
		this.devLog = _devMode ? dh.devLog.createLog(`=${this._key}`) : udFun;
		this.errLog = dh.errLog.createLog(`=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('', this._key);
		
		this.devLog('created.');
	}
	
	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this.devLog('destroyed.');
		
		this._offOnDestroy();
		this._offOnDestroy = null;
		
		this._destroyed = true;
		this._value = null;
		this._dh = null;
		this._emitter = null;
		this.devLog = null;
		this.errLog = null;
		this.destroyedErrorLog = null;
		this._key = null;
	}
}