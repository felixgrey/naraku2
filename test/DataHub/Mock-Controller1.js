const Utils = require('../../lib/Utils/index.js');
const Emitter = require('../../lib/DataHub/Emitter.js').default;

const {
	getUniIndex,
} = Utils;

const MockController0 = require('./Mock-Controller0');

const FetchManager = require('../../lib/DataHub/FetchManager.js').default;
const RunnerManager = require('../../lib/DataHub/RunnerManager.js').default;
const ListenerManager = require('../../lib/DataHub/ListenerManager.js').default;

class MockController1 extends MockController0{
	constructor(dh) {
		super(dh)
	  
		this._fetchManager = new FetchManager(this, 40, true);
		this._runnerManager = new RunnerManager(this, true);
		this._listenerManager = new ListenerManager(this, true);
		
	}
	
}



module.exports = MockController1;