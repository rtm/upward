// UpAttributes/.is
// ================

import keepAssigned    from './Ass';
import C               from './Fun';
import {invertify}     from './Ify';
import {observeObject, makeObserver} from './Obs';
import {dasherize}     from './Str';

var {push} = Array.prototype;
var {keys, defineProperty} = Object;

var subAttrs = ['style', 'class', 'dataset'];
function isSubattr(a) { return subAttrs.indexOf(a) !== -1; }

// Make observers for attributes, and subattributes
// ------------------------------------------------
function makeAttrsObserver(e) {
  function add(v, k)     { e.setAttribute(k, valueize(v)); }
  function _delete(v, k) { e.removeAttribute(k); }
  return makeObserver({add, update: add, delete: _delete});
}

function makeStyleObserver(e) {
  function add(v, k)     { e.style[k] = v; }
  function _delete(v, k) { e.style[k] = ''; }
  return makeObserver({add, update: add, delete: _delete});
}

function makeDatasetObserver(e) {
  function add(v, k)     { e.dataset[k] = v; }
  function _delete(v, k) { delete e.dataset[k]; }
  return makeObserver({add, change: add, delete: _delete});
}

function makeClassObserver(e) {
  function add(v, k)     { e.classList.toggle(dasherize(k), v); }
  function _delete(v, k) { e.classList.remove(dasherize(k)); }
  return makeObserver({add, change: add, delete: _delete});
}

function UpAttributes(elt, attrs) {

  // Function to repopulate classes on the element when they change.
  var upClasses = C(function(classes) {
    classes = classes || {};
    keys(classes).forEach(cls => elt.classList.toggle(dasherize(cls), classes[cls]));
  });

  // Function to repopulate styles on the element when they change.
  var upStyles = C(function(styles) {
    styles = styles || {};
    keys(styles).forEach(prop => elt.style[prop] = styles[prop]);
  });

  // TODO: do datasets

  // Function to repopulate attributes on the element when they change.
  var upAttrs = C(function(attrs) {
    attrs = attrs || {};
    keys(attrs)
      .filter(invertify(isSubattr))
      .forEach(attr => elt.setAttribute(attr, attrs[attr]));
  });

  upAttrs  (attrs);
  upClasses(attrs.class);
  upStyles (attrs.style);
  return elt;
}

// Add UpAttributes to Element prototype as `.is`.
const ISPROP = 'is';
console.assert(!HTMLElement.prototype[ISPROP], "Duplicate assignment to HTMLElement.is");
defineProperty(HTMLElement.prototype, ISPROP, {
  value(attrs) { return UpAttributes(this, attrs); }
});

export default UpAttributes;
