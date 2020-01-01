import {
	getUniIndex,
	udFun,
	createLog,
	isNvl,
} from './../Utils';

import Emitter from './Emitter';
import LifeCycle from './../Common/LifeCycle';


export default class Component extends LifeCycle {

	_initialization(container) {
		if (typeof container !== 'object') {
			container = {
				_key: '???',
				_clazz: '???',
			};
		}
		
		this._dhc = container._dhc || null;
		this._dh = container._dh || null;
		this._store = container._store || null;
		this._emitter = container._emitter || udFun;
		this.devLog = container.devLog || udFun;
		this.errLog = container.errLog || udFun;
		
		this._emitter.once(`$$destroy:${container._clazz}=${container._key}`, () => {
			this.devLog(`${container._clazz}=${container._key} destroyed => ${this._logName} destroyed .`);
			this.destroy();
		});
		
		if (createLog.showPublicMethods) {
			this.devLog(`publicMethods of ${this._clazz}`, this.constructor.prototype._publicMethods);
		}
	}
	
	_destruction() {
		this._dh = null;
		this._dhc = null;
		this._store = null;
	}
}

Component.publicMethod = LifeCycle.publicMethod;
