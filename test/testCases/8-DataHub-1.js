const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');
// require('./../TestTools/Init-Fetcher0.js');


const DataHub = require(`../../lib/DataHub/DataHub.js`).default;
let dataHub
console.log(`\n=============== DataHub start ===============\n`);

dataHub = new DataHub({}, getUnion());

console.log(`\n--------------  DataHubdestroy --------------`);
dataHub.destroy();

console.log(`\n--------------  DataHub --------------`);


dataHub = new DataHub({
	testStore1: [1,2,3],
	testStore2: [1,2,3],
}, getUnion());
dataHub.destroy();

// ----------------------------------------------------------- //



console.log(`\n=============== DataHub end ===============\n`);