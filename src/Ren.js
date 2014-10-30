// keepRendered: create dynamically updated DOM node.
// =================================================

// Bookkeeping and initialization.
import {upward, unupward, Upwardable, upwardify, upwardifyWithObjectParam} from './Upw';

import {dasherize}                   from './Str';
import {mapObject, valueizeObject}   from './Obj';
import {observeObject, makeObserver} from './Obs';
import keepAssigned                  from './Ass';

var {push} = Array.prototype;

var subAttrs = ['style', 'class', 'dataset'];
function isSubattr(a) { return subAttrs.contains(a); }

// Make observers for children, attributes, and subattributes.
// -----------------------------------------------------------
function makeChildrenObserver(e) {
  function add(v)        { e.appendChild(v); }
  function _delete(v)    { e.removeChild(v); }
  function update(v, i, c, {oldValue}) { e.replaceChild(v, oldValue); }
  return makeObserver({add, update, delete: _delete});
}

function makeAttrsObserver(e) {
  function add(v, k)     { e.setAttribute(k, v); }
  function _delete(v, k) { e.removeAttribute(k); }
  return makeObserver({add, update: add, delete: _delete});
}

function makeStyleObserver(s) {
  function add(v, k)     { elt.style[k] = v; }
  function _delete(v, k) { result.style[name] = ""; };
  return makeObserver({add, update: add, delete: _delete});
}

function makeDatasetObserver(e) {
  function add(v, k)     { e.dataset[k] = v; }
  function _delete(v, k) { delete e.dataset[k]; }
  return makeObserver({add, change: add, delete: _delete});
}

function makeClassObserver(e) {
  function add(v, k)     { e.classList.toggle(dasherize(k), v); }
  function _delete(v, k) { e.classList.remove(dasherize(k)); };
  return makeObserver({add, change: add, delete: _delete});
}

function _keepRendered(tagName, params) {

  // Handle changes to parameters.
  // -----------------------------
  function makeParamsObserver() {
    
    // Observe and unobserve the children.
    function _observeChildren  (v) { observeObject  (v, childrenObserver); }
    function _unobserveChildren(v) { unobserveObject(v, childrenObserver); }
    
    function _observeAttrs(v) {
      observeObject(v, AttrsObserver);
      subAttrs.forEach(a => observeObject(v[a], subAttrObservers[a]));
    }
    function _unobserveAttrs(v) {
      unobserveObject(v, AttributesObserver);
      subAttr.forEach(a => unobserveObject(v[a], subAttrObservers[a]))
    }

    // When we get a new parameter, set up observers.
    function add(v, i) {
      switch (i) {
      case 'children': _observeChildren(v); brek;
      case 'atts':     _observeAttrs(v); break;
      }
    }
    
    // When parameters change, tear down and resetup observers.
    function update(v, i, params, {oldValue}) {
      switch (i) {
      case 'children': _unobserveChildren(oldValue); _observeChildren(v); break;
      case 'attrs':    _unobserveAttrs   (oldValue); _observeAttrs   (v); break;
      }
    }
    
    return makeObserver({add, update});
  }

  var result = document.createElement(tagName);

  var subAttrObservers = {
    class:   makeClassObserver(result),
    dataset: makeDatasetObserver(result),
    style:   makeStyleObserver(result)
  };
  var attrsObserver = makeAttrsObserver(result);
  var childrenObserver = makeChildrenObserver(result);
  
  mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
  params = valueizeObject(params);
  params.attrs = keepAssigned(params.attrs, {style: {}, class: {}, dataset: {}}, push);
  params.children = params.children || [];
  observeObjectNow(params, paramsObserver);

  return result;
}

export default function(tagName, attrs = {}, children = []) {
  return _keepRendered(tagName, {attrs, children});
}
