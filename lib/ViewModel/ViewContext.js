"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Tree = _interopRequireDefault(require("./Tree.js"));

var _DataHub = _interopRequireDefault(require("../DataHub/DataHub"));

var _Controller = _interopRequireDefault(require("../DataHub/Controller"));

var _Container = _interopRequireDefault(require("../DataHub/Container"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ViewContext extends _Container.default {
  initialization() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    super.initialization(...args);
    var [dhConfig] = args;
    this.tree = new _Tree.default(this.union);
    this.dataHub = new _DataHub.default(dhConfig, this.union);
    this.dataHubController = this.dataHub.getController();
    this.publicMethods(_Tree.default.publicMethods, 'tree');
    this.publicMethods(_Controller.default.publicMethods, 'dataHubController');
  }

  bindContainer(instance) {
    super.bindContainer(instance);
    instance.dataHub = this.dataHub;
    instance.dataHubController = this.dataHubController;
    instance.viewContext = this;
  }

  destruction() {
    super.destruction();
    this.tree.destroy();
    this.tree = null;
    this.dataHub.destroy();
    this.dataHub = null;
    this.dataHubController = null;
    this.extendData = null;
  }

}

exports.default = ViewContext;