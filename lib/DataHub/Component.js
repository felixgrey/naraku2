"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("../Utils");

var _Emitter = _interopRequireDefault(require("../Common/Emitter"));

var _LifeCycle = _interopRequireDefault(require("../Common/LifeCycle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Component extends _LifeCycle.default {
  initialization(container) {
    this.containerDestroyOff = this.bindContainer(container);

    if (this.constructor.$showPublicMethods) {
      this.devLog("publicMethods of ".concat(this.clazz), this.constructor.prototype.$$publicMethods);
    }
  }

  bindContainer(container) {
    container.bindUnion(this, this.logName);
    return this.emitter.once("$$destroy:".concat(container.clazz, "=").concat(container.key), () => {
      this.devLog("".concat(container.clazz, "=").concat(container.key, " destroyed => ").concat(this.logName, " destroyed ."));
      this.destroy();
    });
  }

  destruction() {
    this.containerDestroyOff();
    this.containerDestroyOff = null;
    this.dataHub = null;
    this.dataHubController = null;
    this.dataStore = null;
  }

}

exports.default = Component;
Component.publicMethod = _LifeCycle.default.publicMethod;