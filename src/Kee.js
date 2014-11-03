// Utilities for making "keepXXX'd" style functions.

// keepify: create a keepified function
// ====================================

import {upward, unupward, valueizeObject, upwardCapture} from './Upw';
import {makeObserver, observeObject, unobserveObject, observeObjectNow} from './Obs';
import {valueize, mapObject} from './Obj';
import {noop, identity} from './Fun';
import {copyOnto, makeCounterMap} from './Utl';

function keepify(fn, observer) {

  // Keep track of how many recomputations were done, using a WeakMap.
  var counter = makeCounterMap();

  function go() {
    counter.incr(result);
    fn();
  }

  return function(params) {
    var result = Upwardable();
    counter.init(result);
    mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
    params = valueizeObject(params);
    params.trigger = 0;
    observeObjectNow(params, Observer);
    return result;
  };
}

var LENGTH = keepify(
  function({a}) {
    return a.length;
  }
);

