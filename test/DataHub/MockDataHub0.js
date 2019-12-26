const Utils = require('../../lib/Utils/index.js');
const Emitter = require('../../lib/DataHub/Emitter.js').default;

const {
	isDev,
	showLog,
	onGlobal,
	
	uidSeed,
	createUid,
	getUniIndex,

	udFun,
	nvlFun,
	eptFun,
	sameFun,
	pmsFun,

	isNvl,
	isEmpty,
	isBlank,

	getDeepValue,
	snapshot,

	createLog,
	errorLog,
	createDestroyedErrorLog,
	getLogInfo,

	NumberFormat,
	toCamel,
	toUnderline
} = Utils;


class MockDataHub0 {
	constructor(cfg, devLog = udFun, errLog = udFun) {
	  this._key = getUniIndex();
		
		this.devLog = devLog.createLog(`MockDataHub0=${this._key}`);
		this.errLog = errLog.createLog(`MockDataHub0=${this._key}`);;
		
		this._emitter = new Emitter(this.devLog, this.errLog);
		// Controller
		// ConfigManager
		// Controller.ListenerManager
		// Controller.RunnerManager
		// Controller.FetcherManager
		// Controller.FetchStoreManager
	}
	
	destroy() {
		
		this._emitter.emit('$$destroy:dataHub', this._key);
		this._emitter.destroy();
		
		this._emitter = null;
	}
}



module.exports = MockDataHub0;