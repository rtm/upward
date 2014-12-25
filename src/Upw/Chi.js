// upChildren
// ==========

import C from './Fun';
import T from './Txt';

var {appendChild, removeChild} = Node.prototype;
var {filter}                   = Array.prototype;
var {defineProperty}           = Object;

/**
 * ## upChildren
 *
 * Specify the children of an HTML element.
 * As the input array changes, the element's children are added and removed.
 *
 * @param {HTMLElement} elt element to add children to
 * @param {Node[]} children array of nodes to add as children
 */

function UpChildren(elt, children) {
  var f = C(function _UpChildren(children) {

    filter.call(elt.childNodes, child => children.indexOf(child) === -1)
      .forEach(removeChild, elt);

    children
      .filter(Boolean)
      .map(c => typeof c.valueOf() === 'string' ? T(c) : c)
      .forEach(appendChild, elt);
  });

  // Permit any combination of single nodes and arrays as arguments.
  f(Array.isArray(children) ? children : [children]);
  return elt;
}

// Add `UpChildren` as property on Node prototype, named `has`.
// Usage:
// ```
// E('div') . has ([children, ...])
// ```
const HASPROP = 'has';

/* @TODO: Make this a non-enumerable property on prototype. */
Node.prototype.has = function(children) {
  return UpChildren(this, children);
};

export default UpChildren;

