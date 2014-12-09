// UpAttributes/.is
// ================

//import U from './Upw';

import {dasherize}                   from '../Utl//Str';

import {mapObject, valueize, valueizeObject}   from '../Utl/Obj';
import {observeObject, makeObserver, observeObjectNow} from '../Utl//Obs';
import keepAssigned                  from './Ass';

var {push} = Array.prototype;
var {defineProperty} = Object;

var subAttrs = ['style', 'class', 'dataset'];
function isSubattr(a) { return subAttrs.contains(a); }

// Make observers for attributes, and subattributes.
// -----------------------------------------------------------
function makeAttrsObserver(e) {
  function add(v, k)     { e.setAttribute(k, valueize(v)); }
  function _delete(v, k) { e.removeAttribute(k); }
  return makeObserver({add, update: add, delete: _delete});
}

function makeStyleObserver(s) {
  function add(v, k)     { elt.style[k] = v; }
  function _delete(v, k) { result.style[name] = ""; }
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

  // Handle changes to parameters.
  // -----------------------------
  function makeParamsObserver() {
    
    function _observeAttrs(v) {
      observeObjectNow(v, attrsObserver);
      subAttrs.forEach(a => observeObjectNow(v[a], subAttrObservers[a]));
    }
    function _unobserveAttrs(v) {
      unobserveObject(v, AttributesObserver);
      subAttr.forEach(a => unobserveObject(v[a], subAttrObservers[a]));
    }

    // When we get a new parameter, set up observers.
    function add(v, i) {
      switch (i) {
      case 'attrs':    _observeAttrs   (v); break;
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

  var subAttrObservers = {
    class:   makeClassObserver(result),
    dataset: makeDatasetObserver(result),
    style:   makeStyleObserver(result)
  };
  var attrsObserver = makeAttrsObserver(result);
  var paramsObserver = makeParamsObserver();  

  //mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
  params = valueizeObject(params);
  params.attrs = keepAssigned(params.attrs, {style: {}, class: {}, dataset: {}}, push);
  observeObjectNow(params, paramsObserver);

  return elt;
}

// Add UpAttributes to Element prototype as `.is`.
const ISPROP = 'is';
console.assert(!HTMLElement.prototype[ISPROP], "Duplicate assignment to HTMLElement.is");
defineProperty(HTMLElement.prototype, ISPROP, {
  value(attrs) { return UpAttributes(this, attrs); }
});

export default UpAttributes;
