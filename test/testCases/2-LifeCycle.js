const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
} = require('./../TestTools/TestTools.js');
// require('./../TestTools/Init-Fetcher0.js');

// ----------------------------------------------------------- //
const Union = require(`../../lib/Common/Union.js`).default;
const LifeCycle = require(`../../lib/Common/LifeCycle.js`).default;
// ----------------------------------------------------------- //

const union = new Union({
	devMode: true,
	devLog: Utils.createLog('Tester', 'log'),
	errLog: Utils.createLog('Tester', 'error'),
});

let lifeCycle = new LifeCycle(union);
lifeCycle.destroy();

const publicMethod = LifeCycle.publicMethod;

class SubLifeCycle extends LifeCycle{
	initialization(...args){
		console.log(args)
	}
	
}
new SubLifeCycle(1,2,3, union)



lifeCycle =  new LifeCycle(union);