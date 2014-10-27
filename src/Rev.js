// keepReversed: Keep an array in original, or reversed order.
// ===========================================================

import {
  upward,
  valueOfObject
} from './Upw';

import {
  makeObserver,
  observeObject,
  unobserveObject,
  observeObjectNow,
} from './Obs';

import {
  valueOf,
  mapObject
}from './Obj';

// Keep an array in reversed order.
// @TODO handle sparse arrays
function _keepReversed(params) {
  var result = [];
  var arrayObserver;
  var paramsObserver;

  // Calculate corresponding position in reversed array.
  function pos(i) {
    var {a, up} = params;
    return up ? i : a.length - 1 - i;
  }
  
  // Handle changes to parameters.
  // -----------------------------
  function makeParamsObserver() {
    
    // Observe and unobserve the array.
    function _observe  (v) { observeObject  (v, arrayObserver); }
    function _unobserve(v) { unobserveObject(v, arrayObserver); }
    
    // When we get a new array, set up observer on it.
    function add(v, i) {
      if (i === 'a') {  _observe(v); }
    }
    
    // When the array changes, tear down and resetup observer on it.
    function update(v, i, params, {oldValue}) {
      if (i === 'a') { _unobserve(oldValue); _observe(v); }
    }
    
    // Redo the reversal, when parameters have changed.
    function end({a, up}) {
      var len = a.length;
      for (let i = 0; i < len; i++) {
        result[i] = a[pos(i)];
      }
      result.length = len;
    }
    
    return makeObserver({add, update, end});
  }
  
  // Handle changes to array itself.
  // -------------------------------
  function makeArrayObserver() {
    
    // Element has been added (at end?)
    function add(v) {
      result.unshift(v);
    }
    
    // Update an element if it is in range of the slice.
    function update(v, i) {
      var {a, from, to} = params;
      if (i === 'length') {
        //slice array
      } else {
        console.assert(!isNaN(i), "index in keepSliced#update must be numeric");
        result[pos(i)] = v;
      }
    }
    
    // Delete an element if it is in range of the slice.
    function _delete(_, i) {
      var {from, to} = params;
      console.assert(!isNaN(i), "index in keepSliced#_delete must be numeric");
      delete a[pos(i)];
    }
    
    return makeObserver({add, update, delete: _delete});
  }

  mapObject(params, (v, k) => upward(v, vv => params[k] = vv));

  params = valueOfObject(params);
  params.up = params.up || false;
  arrayObserver = makeArrayObserver();
  paramsObserver = makeParamsObserver();
  observeObjectNow(params, paramsObserver);

  return result;
}

export default function(a, up = false) {
  return _keepReversed({a, up});
}
