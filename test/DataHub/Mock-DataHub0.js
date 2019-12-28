const Utils = require('../../lib/Utils/index.js');
const Emitter = require('../../lib/DataHub/Emitter.js').default;

const {
	getUniIndex,
	udFun,
} = Utils;


class MockDataHub0 {
	constructor(cfg, devLog = udFun, errLog = udFun) {
	  this._key = getUniIndex();
		
		this._destroyed = false;
		
		this.devLog = devLog.createLog(`MockDataHub0=${this._key}`);
		this.errLog = errLog.createLog(`MockDataHub0=${this._key}`);;
		
		this._emitter = new Emitter(this.devLog, this.errLog, true);
		
		// Controller
		// ConfigManager
		// Controller.ListenerManager
		// Controller.RunnerManager
		// Controller.FetcherManager
		// Controller.FetchStoreManager
		
		this.devLog(`MockDataHub0=${this._key} created.`);
	}
	
	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this.devLog(`MockDataHub0=${this._key} destroyed.`);
		
		this._emitter.emit('$$destroy:DataHub', this._key);
		this._emitter.emit('$$destroy:DataHub:' + this._key);
		this._emitter.destroy();
		
		this._destroyed = true;
		this._emitter = null;
	}
}



module.exports = MockDataHub0;