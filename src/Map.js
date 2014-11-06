// Keepmapped: Keep a map of an array up-to-date.
// ==============================================

import {upward, unupward, valueizeObject, upwardCapture} from './Upw';
import {makeObserver, observeObject, unobserveObject, observeObjectNow} from './Obs';
import {valueize, mapObject} from './Obj';
import {noop, identity} from './Fun';
import {copyOnto, makeCounterMap} from './Utl';

// Keep track of how many recomputations were done, using a WeakMap.
var counter = makeCounterMap();

// Keep an array in sorted order.
function _keep(params) {

  // Trigger a change in params when an input value changes.
  // This will end up causing a recomputation.
  // Also remove the cached map value.
  function makeTrigger(elt) {
    return function() {
      // @TODO: unwind existing upward settings for this elt, if any
      map.delete(Object(elt));
      params.trigger++;
    };
  }


  // Make a mapping function for elements.
  // If we already have information in the cache, use that.
  // Otherwise, calculate result, cache it, and set up upwards.
  function mapper(fn) {
    return function(elt) {
      elt = valueize(elt);
      var {result, triggerFunc, captures} = map.get(Object(elt)) || {};
      if (typeof result === 'undefined') {
        triggerFunc = makeTrigger(elt);
        captures = upwardCapture(_ => result = fn(elt));
        map.set(Object(elt), {result, triggerFunc, captures});
        captures.forEach(u => upward(u, triggerFunc));
      }
      return result;
    };
  }

  // Perform the sort. Capture upwards affecting order.
  function end() {
    var {a, fn} = params;
    counter.incr(result);
    copyOnto(a.map(mapper(fn)), result);
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
      switch(i) {
      case 'a':  _unobserve(oldValue); _observe(v); break;
      case 'fn': map.clear();
      }
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

  // Keep a map of information about each map input.
  // Format is {value, triggerfunc, captures}.
  var map = new WeakMap();

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
