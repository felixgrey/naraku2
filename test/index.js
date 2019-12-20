process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'product';
process.env.SHOW_DEVLOG = 'true';

// require('./DataHub/Utils/index.js');
// require('./DataHub/Fetcher.js');
require('./DataHub/Emitter.js');
