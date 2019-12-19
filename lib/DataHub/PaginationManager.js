"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PaginationManager =
/*#__PURE__*/
function () {
  function PaginationManager() {
    _classCallCheck(this, PaginationManager);

    this.count = 0;
    this.startPage = 1;
    this.currentPage = 1;
  }

  _createClass(PaginationManager, [{
    key: "setDataCount",
    value: function setDataCount(count) {
      this.count = count;
    }
  }, {
    key: "getPaginationInfo",
    value: function getPaginationInfo() {
      return {
        count: this.count,
        startPage: this.startPage,
        currentPage: this.currentPage
      };
    }
  }]);

  return PaginationManager;
}();

exports.default = PaginationManager;