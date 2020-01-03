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
  afterCreate() {
    this._root = null;
    this._parent = null;
    this._last = null;
    this._nameMap = {};
    this._keyMap = {};
  }

  beforeDestroy() {
    this._root = null;
    this._parent = null;
    this._last = null;
    this._nameMap = null;
    this._keyMap = null;
  }

  removeNode(key) {
    var _delete = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if ((0, _Utils.isBlank)(key) || !this._keyMap[key]) {
      return;
    }

    var node = this._keyMap[key];
    node.children.forEach((node, index) => {
      this.removeNode(node.key, false);
    });
    var pChildren = (this._keyMap[node.parentKey] || {}).children || [];

    for (var i = 0; i < pChildren.length; i++) {
      if (pChildren[i].key === key) {
        pChildren[i] = null;
        break;
      }
    }

    delete this._keyMap[key];

    if (_delete) {
      Object.values(this._keyMap).forEach(_node => {
        _node.children = _node.children.filter(__node => __node !== null);
      });
    }
  }

  getNode(key) {
    if ((0, _Utils.isBlank)(key)) {
      return null;
    }

    return this._keyMap[key] || null;
  }

  getParent(key) {
    if ((0, _Utils.isBlank)(key)) {
      return null;
    }

    if (!this._keyMap[key]) {
      this.methodErrLog('getParent', [key], 'notExist');
      return null;
    }

    var parentKey = this._keyMap[key].parentKey;
    return this._keyMap[parentKey] || null;
  }

  getParentChain(key) {
    if ((0, _Utils.isBlank)(key)) {
      return [];
    }

    if (!this._keyMap[key]) {
      this.methodErrLog('getParentChain', [key], 'notExist');
      return [];
    }

    var nodes = [];
    var parentKey = this._keyMap[key].parentKey;

    while (parentKey) {
      var parentNode = this._keyMap[parentKey];
      nodes.push(parentNode);
      parentKey = parentNode.parentKey;
    }

    return nodes;
  }

  createNode(key) {
    var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if ((0, _Utils.isBlank)(key)) {
      this.methodErrLog("createNode", [key], "blankKey");
      return;
    }

    if (this._keyMap[key]) {
      this.methodErrLog("createNode", [key], "duplicateKey");
      return;
    }

    var node = {
      key,
      parentKey: null,
      payload,
      children: []
    };
    this._last = node;
    this._keyMap[key] = node;

    if (this._root === null) {
      this._root = node;
      this._parent = node;
    } else {
      node.parentKey = this._parent.key;

      this._parent.children.push(node);
    }
  }

  getRoot() {
    return this._root;
  }

  setParent(key) {
    if ((0, _Utils.isBlank)(key) || !this._keyMap[key]) {
      this.methodErrLog("setParent", [key], "blankKey");
      return;
    }

    this._parent = this._keyMap[key];
  }

}, (_applyDecoratedDescriptor(_class.prototype, "removeNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "removeNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getRoot", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getRoot"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setParent"), _class.prototype)), _class);
exports.default = Tree;
Tree.$loggerByParam = true;
Tree.publicMethods = publicMethods;