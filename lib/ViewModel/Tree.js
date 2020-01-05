"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _LifeCycle = _interopRequireDefault(require("./../Common/LifeCycle"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var {
  publicMethod
} = _LifeCycle.default;
var publicMethods = ['removeNode', 'getNode', 'getParent', 'getParentChain', 'createNode', 'getRoot', 'setParent'];
var Tree = (_class = class Tree extends _LifeCycle.default {
  initialization() {
    this.root = null;
    this.parent = null;
    this.last = null;
    this.nameMap = {};
    this.keyMap = {};
  }

  destruction() {
    this.root = null;
    this.parent = null;
    this.last = null;
    this.nameMap = null;
    this.keyMap = null;
  }

  removeNode(key) {
    var deleteChild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if ((0, _Utils.isBlank)(key) || !this.keyMap[key]) {
      return;
    }

    var node = this.keyMap[key];
    node.children.forEach((node, index) => {
      this.removeNode(node.key, false);
    });
    var pChildren = (this.keyMap[node.parentKey] || {}).children || [];

    for (var i = 0; i < pChildren.length; i++) {
      if (pChildren[i].key === key) {
        pChildren[i] = null;
        break;
      }
    }

    delete this.keyMap[key];

    if (deleteChild) {
      Object.values(this.keyMap).forEach(node1 => {
        node1.children = node1.children.filter(node2 => node2 !== null);
      });
    }
  }

  getNode(key) {
    if ((0, _Utils.isBlank)(key)) {
      return null;
    }

    return this.keyMap[key] || null;
  }

  getParent(key) {
    if ((0, _Utils.isBlank)(key)) {
      return null;
    }

    if (!this.keyMap[key]) {
      this.methodErrLog('getParent', [key], 'notExist');
      return null;
    }

    var parentKey = this.keyMap[key].parentKey;
    return this.keyMap[parentKey] || null;
  }

  getParentChain(key) {
    if ((0, _Utils.isBlank)(key)) {
      this.devLog('getParentChain blankKey');
      return [];
    }

    if (!this.keyMap[key]) {
      this.methodErrLog('getParentChain', [key], 'notExist');
      return [];
    }

    var nodes = [];
    var parentKey = this.keyMap[key].parentKey;

    while (parentKey) {
      var parentNode = this.keyMap[parentKey];
      nodes.push(parentNode);
      parentKey = parentNode.parentKey;
    }

    return nodes;
  }

  createNode(key) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if ((0, _Utils.isBlank)(key)) {
      this.methodErrLog("createNode", [key], "blankKey");
      return;
    }

    if (this.keyMap[key]) {
      this.methodErrLog("createNode", [key], "duplicateKey");
      return;
    }

    var node = {
      key,
      type,
      parentKey: null,
      payload,
      children: []
    };
    this.last = node;
    this.keyMap[key] = node;

    if (this.root === null) {
      this.root = node;
      this.parent = node;
    } else {
      node.parentKey = this.parent.key;
      this.parent.children.push(node);
    }
  }

  getRoot() {
    return this.root;
  }

  setParent(key) {
    if ((0, _Utils.isBlank)(key) || !this.keyMap[key]) {
      this.methodErrLog("setParent", [key], "blankKey");
      return;
    }

    this.parent = this.keyMap[key];
  }

}, (_applyDecoratedDescriptor(_class.prototype, "removeNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "removeNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getRoot", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getRoot"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setParent"), _class.prototype)), _class);
exports.default = Tree;
Tree.publicMethods = publicMethods;