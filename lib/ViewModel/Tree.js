"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _LifeCycle2 = _interopRequireDefault(require("./../Common/LifeCycle"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethod = _LifeCycle2.default.publicMethod;
var Tree = (_class =
/*#__PURE__*/
function (_LifeCycle) {
  _inherits(Tree, _LifeCycle);

  function Tree() {
    _classCallCheck(this, Tree);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tree).apply(this, arguments));
  }

  _createClass(Tree, [{
    key: "afterCreate",
    value: function afterCreate() {
      this._root = null;
      this._parent = null;
      this._last = null;
      this._nameMap = {};
      this._keyMap = {};
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      this._root = null;
      this._parent = null;
      this._last = null;
      this._nameMap = null;
      this._keyMap = null;
    }
  }, {
    key: "removeNode",
    value: function removeNode(key) {
      var _this = this;

      var _delete = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if ((0, _Utils.isBlank)(key) || !this._keyMap[key]) {
        return;
      }

      var node = this._keyMap[key];
      node.children.forEach(function (node, index) {
        _this.removeNode(node.key, false);
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
        Object.values(this._keyMap).forEach(function (_node) {
          _node.children = _node.children.filter(function (__node) {
            return __node !== null;
          });
        });
      }
    }
  }, {
    key: "getNode",
    value: function getNode(key) {
      if ((0, _Utils.isBlank)(key)) {
        this.methodErrLog('getNode', [key], 'blankKey');
        return;
      }

      return this._keyMap[key];
    }
  }, {
    key: "getParentChain",
    value: function getParentChain(key) {
      if ((0, _Utils.isBlank)(key) || !this._keyMap[key]) {
        this.methodErrLog('getParentChain', [key], 'blankKey');
        return;
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
  }, {
    key: "createNode",
    value: function createNode(key) {
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
        key: key,
        parentKey: null,
        payload: payload,
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
  }, {
    key: "getRoot",
    value: function getRoot() {
      return this._root;
    }
  }, {
    key: "setParent",
    value: function setParent(key) {
      if ((0, _Utils.isBlank)(key) || !this._keyMap[key]) {
        this.methodErrLog("setParent", [key], "blankKey");
        return;
      }

      this._parent = this._keyMap[key];
    }
  }]);

  return Tree;
}(_LifeCycle2.default), (_applyDecoratedDescriptor(_class.prototype, "removeNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "removeNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getParentChain", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getParentChain"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getRoot", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getRoot"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setParent"), _class.prototype)), _class);
exports.default = Tree;
Tree.$loggerByParam = true;