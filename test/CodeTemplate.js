import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

export default class ? {
	
	constructor(container, _devMode = false) {
	  this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
	  this._destroyed = false;
		
		this._dhc = container._dhc;
		this._dh = container._dh;
		this._emitter = container._emitter;
		
		this.devLog = _devMode ? container.devLog.createLog(this._logName) : udFun;
		this.errLog = container.errLog.createLog(this._logName);
		this.destroyedErrorLog = createDestroyedErrorLog(this._clazz, this._key);
		
		this._emitter.once(`$$destroy:${container._clazz}:${dhc._key}`, () => {
			this.devLog && this.devLog(`${container._clazz} destroyed => ${this._clazz} destroy .`);
			this.destroy();
		});

		this.devLog(`${this._logName} created.`);
	}
	
	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this.devLog(`${this._logName} destroyed.`);
		
		this._emitter.emit(`$$destroy:${this._clazz}`, this._key);
		this._emitter.emit(`$$destroy:${this._clazz}:${this._key}`);
		
		this._destroyed = true;
		
		this._dh = null;
		this._dhc = null;
		this._emitter = null;
		
		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}