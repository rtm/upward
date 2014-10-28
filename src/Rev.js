// keepReversed: Keep an array in reversed order.
// ==============================================

import {upward, valueizeObject} from './Upw';
import {makeObserver, observeObject, unobserveObject, observeObjectNow} from './Obs';
import {mapObject} from './Obj';
import {noop} from './Fun';
import {copyOnto} from './Utl';

// Keep an array in reversed order.
function _keepReversed(params) {

  // Perform the reversal.
  function end() {
    var {a, up} = params;
    var tmp = a.slice();
    if (!up) { tmp.reverse(); }
    copyOnto(tmp, result);
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
  params = valueizeObject(params);
  params.up = params.up || false;
  observeObjectNow(params, paramsObserver);

  return result;
}

export default function(a, up = false) {
  return _keepReversed({a, up});
}
