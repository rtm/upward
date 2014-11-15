// keepSorted: Keep an array in sorted order.
// ==========================================

import U from './Upw';
import {makeObserver, observeObject, unobserveObject, observeObjectNow} from './Obs';
import {valueize, mapObject} from './Obj';
import {noop, identity} from './Fun';
import {makeSortfunc, copyOnto, makeCounterMap} from './Utl';

// Keep track of how many recomputations were done, using a WeakMap.
var counter = makeCounterMap();

// Keep an array in sorted order.
function _keep(params) {

  // Trigger a change in params when an input value changes.
  // This will end up causing a recomputation.
  function trigger() {
    params.trigger++;
  }
  
  // Perform the sort. Capture upwards affecting order.
  function end() {
    var {a, fn} = params;
    counter.incr(result);
    captures.forEach(u => unupward(u, trigger));
    captures = upwardCapture(_ => a.map(valueize).map(fn));
    copyOnto(a.slice().sort(makeSortfunc(fn)), result);
    captures.forEach(u => upward(u, trigger));
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
  var captures = [];
  var arrayObserver = makeArrayObserver();
  var paramsObserver = makeParamsObserver();
  counter.init(result);

  mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
  params = valueizeObject(params);
  params.fn = params.fn || identity;
  params.trigger = 0;
  observeObjectNow(params, paramsObserver);

  return result;
}

export {counter};

export default function(a, fn = identity) {
  return _keep({a, fn});
}
