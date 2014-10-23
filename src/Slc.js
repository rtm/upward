// keepSliced (Array#of)
// =====================
// @TODO Support semantics of negative `from` and `to`.

// Setup.
import {
  copyOnto
}                       from './Utl';

import {
  makeObserver,
  observeObject,
  observeObjectNow,
  unobserveObject,
}                       from './Obs';

import {
  valueOfObject
}                       from './Upw';

var {max}    = Math;
    
// Handle changes to parameters.
// -----------------------------
function observeParams(params, arrayObserver) {
  
  // Observe and unobserve the array.
  function _observe  (v) { observeObject  (v, arrayObserver); }
  function _unobserve(v) { unobserveObject(v, arrayObserver); }
  
  // When we get a new array, set up observer on it.
  function add(v, i) {
    if (i === 'a') {  _observe(v); }
  }
  
  // When the array changes, tear down and resetup observer on it.
  function update(v, i, {oldValue}) {
    if (i === 'a') { _unobserve(oldValue); _observe(v); }
  }
  
  // Redo the slice, when parameters have changed.
  function end({a, from, to}) {
    copyOnto(a.slice(from, to), result);
  }
  
  return observeObjectNow(
    params = valueOfObject(params),
    makeObserver({add, update, end})
  );
}

// Handle changes to array itself.
// -------------------------------
function observeArray() {
  
  // Add an element if it is in range of the slice.
  function add(v, i) {
    console.assert(!isNaN(i), "index in keepSliced#add must be numeric");
    var {to} = params;
    if (i < to) { result.push(v); }
  }
  
  // Update an element if it is in range of the slice.
  function update(v, i) {
    var {a, from, to} = params;
    if (i === 'length') {
      result.length = max(a.length - to, from - to);
    } else {
      console.assert(!isNaN(i), "index in keepSliced#update must be numeric");
      if (i >= from && i < to) {
        result[i - from] = v;
      }
    }
  }
  
  // Delete an element if it is in range of the slice.
  function _delete(_, i) {
    var {from, to} = params;
    console.assert(!isNaN(i), "index in keepSliced#_delete must be numeric");
    if (i >= from && i < to) { delete result[i - from]; }
  }
  
  return makeObserver({add, update, delete: _delete};
}
    
// Keep an array sliced as it changes.
export default function keepSliced(params) {
  var result = [];
  var arrayObserver = observeArray(params);
  params = observeParams(params, arrayObserver);
  return result;
}
