// upChildren: specify children of a DOM element
// =============================================

import C from './Fun';

var {appendChild, removeChild} = Node.prototype;
var {filter}                   = Array.prototype;
var {defineProperty}           = Object;

function upChildren(elt, children) {
  var f = C(function _upChildren(children) {
    var oldChildren = filter.call(elt.childNodes, child => children.indexOf(child) === -1);
    children   .forEach(appendChild, elt);
    oldChildren.forEach(removeChild, elt);
  });
  f(Array.isArray(children) ? children : [children]);
  return elt;
}

// Add `upChildren` as property on Node prototype.
const HASPROP = 'has';

// @TODO: Make this a non-enumerable property on prototype.
Node.prototype.has = function(children) {
  return upChildren(this, children);
};
