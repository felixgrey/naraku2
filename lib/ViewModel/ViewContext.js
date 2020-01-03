"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Tree = _interopRequireDefault(require("./Tree.js"));

var _DataHub = _interopRequireDefault(require("./../DataHub/DataHub"));

var _Controller = _interopRequireDefault(require("./../DataHub/Controller"));

var _LifeCycle = _interopRequireDefault(require("./../Common/LifeCycle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var {
  publicMethod
} = _LifeCycle.default;

class ViewContext extends _LifeCycle.default {
  afterCreate() {
    var dhConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this._tree = new _Tree.default(this.devLog, this.errLog, this._devMode);
    this._dh = new _DataHub.default(dhConfig, this.devLog, this.errLog, this._devMode);
    this._dhc = this._dh.getController();
    this.extendData = {};
    this.publicMethods(_Tree.default.publicMethods, '_tree');
    this.publicMethods(_Controller.default.publicMethods, '_dhc');
  }

  beforeDestroy() {
    this._tree.destroy();

    this._tree = null;

    this._dh.destroy();

    this._dh = null;
    this._dhc = null;
    this.extendData = null;
  }

}

exports.default = ViewContext;
ViewContext.$loggerByParam = true;