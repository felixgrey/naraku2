process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'product';

require('./testCases/1-Utils.js');
require('./testCases/2-LifeCycle.js');
require('./testCases/3-Emitter.js');
require('./testCases/4-RunnerManager.js');
require('./testCases/5-FetchManager-1.js');
require('./testCases/6-DataStore.js');
require('./testCases/7-PaginationManager.js');
require('./testCases/8-DataHub-1.js');
require('./testCases/9-ListenerManager.js');
require('./testCases/10-Controller.js');
require('./testCases/11-DataHub-2.js');
require('./testCases/12-Tree.js');
require('./testCases/13-ViewContext.js');
require('./testCases/14-ViewModel.js');

// 单独测试
// require('./testCases/0-Fetcher.js');
