const Utils = require('../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	createAsyncEqualAssert
} = require('./../TestTools.js');

const {
	createLog,
	udFun
} = Utils;

const {addFetcher} = require('../../lib/DataHub/Fetcher.js');

const MockDataHub0 = require('./Mock-DataHub0');
require('./Init-Fetcher0.js');

const PaginationManager = require('../../lib/DataHub/PaginationManager.js').default;

console.log('--------- test PaginationManager start ---------');

let emitterDevLogger = createLog('TestPaginationManager', 'log', true);
let emitterErrLogger = createLog('TestPaginationManager', 'error', true);

let mdh = new MockDataHub0 ({}, emitterDevLogger, emitterErrLogger);

let pagem = new PaginationManager(mdh, 'test1',true);

pagem.init();

pagem.init({

});

pagem.init({

});

pagem.fetch();
pagem.stopFetch();
pagem.setPageInfo();

pagem.destroy();

pagem.fetch();
pagem.stopFetch();
pagem.setPageInfo();

let pagem2 = new PaginationManager(mdh, true);

addFetcher('pagination.lag','url://a','get', {
	beforeFetch: () => {
		// console.log('--------beforeFetch');
		return {timeout: 5000};
	}
});

pagem2.fetch();
pagem2.stopFetch();
pagem2.setPageInfo();

pagem2.init({
	name: 'test2',
	fetcher: 'pagination.lag',
});

pagem2.fetch();

setTimeout(() => {
	pagem2.stopFetch();
	pagem2.stopFetch();
}, 1000);

console.log('--------- test PaginationManager end ---------');