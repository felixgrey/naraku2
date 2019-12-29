const Utils = require('../../lib/Utils/index.js');
const Emitter = require('../../lib/DataHub/Emitter.js').default;

const {
	getUniIndex,
} = Utils;


class MockController0 {
	constructor(dh) {
	  this._key = getUniIndex();
		
		this._destroyed = false;
		
		this._dh = dh;
		this._emitter = dh._emitter;
		this._dh._dhc = this;
		
		this.devLog = dh.devLog.createLog(`MockController0=${this._key}`);
		this.errLog = dh.errLog.createLog(`MockController0=${this._key}`);

		this.devLog(`MockController0=${this._key} created.`);
	}
	
	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this.devLog(`MockController0=${this._key} destroyed.`);
		
		this._emitter.emit('$$destroy:Controller', this._key);
		this._emitter.emit('$$destroy:Controller:'+this._key);
		
		this._destroyed = true;
	}
}



module.exports = MockController0;