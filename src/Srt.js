// keepSorted: Keep an array in sorted order.
// ==========================================

import {upward, valueOfObject} from './Upw';
import {makeObserver, observeObject, unobserveObject, observeObjectNow} from './Obs';
import {mapObject} from './Obj';
import {noop, identity} from './Fun';
import {makeSortfunc} from './Utl';

// Keep an array in sorted order.
function _keep(params) {

  // Perform the reversal.
  function end() {
    var {a, fn} = params;
    var len = a.length;
    var tmp = a.slice().sort(makeSortfunc(fn));
    for (let i = 0; i < len; i++) {
      result[i] = tmp[i];
    }
    result.length = len;
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
    
    return makeObserver({add, update, end});
  }
  
  // Handle changes to array itself.
  // -------------------------------
  function makeArrayObserver() {
    return makeObserver({update: noop, delete: noop, add: noop, end});
  }

  var result = [];
  var arrayObserver = makeArrayObserver();
  var paramsObserver = makeParamsObserver();

  mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
  params = valueOfObject(params);
  params.fn = params.fn || identity;
  observeObjectNow(params, paramsObserver);

  return result;
}

export default function(a, fn = identity) {
  return _keep({a, fn});
}
