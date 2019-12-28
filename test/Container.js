import Emitter from './Emitter';

import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createLog,
	createDestroyedErrorLog,
} from './../Utils';

export default class Container {
	constructor() {
		this._key = getUniIndex();
		this._logName = `Container=${this._key}`
		
		const devLog = createLog('Container', 'log');
		const errLog = createLog('Container', 'error');
		
		const dh = {};
		const dhc = {};
		const emitter = new Emitter();
		
		dh._key = getUniIndex();
		dh._logName = `DataHub=${dh._key}`;
		dh._devLog = devLog.createLog(dh._logName);
		dh._errLog = errLog.createLog(dh._logName);
		dh._emitter = new Emitter(dh._devLog, dh._errLog, true);	
		dh._dhc = dhc;
		
		dhc._key = getUniIndex();
		dhc._logName = `Controller=${dh._key}`;
		dhc._dh = dh;
		dhc._emitter = dh._emitter;
		dhc._devLog = dh._devLog.createLog(dhc._logName);
		dhc._errLog = dh._errLog.createLog(dhc._logName);

		this._dh = dh;
		this._dhc = dhc;

	}
	
	destroy() {
		
		this._emitter.emit(`$$destroy:Controller`, this._dhc._key);
		this._emitter.emit(`$$destroy:Controller:${this._dhc._key}`);
		
		this._emitter.emit(`$$destroy:DataHub`, this._dh._key);
		this._emitter.emit(`$$destroy:DataHub:${this._dh._key}`);
	}
}