const Utils = require('../../lib/Utils/index.js');
const Emitter = require('../../lib/DataHub/Emitter.js').default;

const {
	getUniIndex,
	udFun,
} = Utils;

const MockDataHub0 = require('./Mock-DataHub0');

const DataStore = require('../../lib/DataHub/DataStore.js').default;
const PaginationManager = require('../../lib/DataHub/PaginationManager.js').default;

class MockDataHub1  extends MockDataHub0 {
	constructor(cfg, devLog = udFun, errLog = udFun) {
		super(cfg, devLog, errLog);
		
		this._dataCenter = {};
		this._paginationData = {};
		
		this.devLog(`MockDataHub1=${this._key} created.`);
	}
	
	getDataStore(name) {
		if (!this._dataCenter[name]) {
			this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, true);
		}
		return this._dataCenter[name];
	}
	
	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this.devLog(`MockDataHub1=${this._key} destroyed.`);
		
		this._emitter.emit('$$destroy:dataHub', this._key);
		
		super.destroy();
	}
}



module.exports = MockDataHub1;