// keepConcatenated
// =================

// Define an array composed of multiple arrays, which keeps itself updated.
// Addition objects can be added with `and`.

// Convenience.
import {valueOf, mapObject}            from './Obj';
import {upwardConfig}                   from './Cfg';
import {argify}                          from './Fun';
import {Upwardable, upward}              from './Upw';
import {makeObserver, observeObject}   from './Obs';

var {create, assign, defineProperty} = Object;

// Create the `keepAssigned` object.
function keepConcatenated(...arrays) {

  function add(a) { return _keepConcatenated(kc, a); }

  var result = defineProperties([], { and: { value: add } });
  var kc     = create(null, { arrays: { value: [] } });

  arrays.forEach(add);
  return result;
}

// Push one array onto a keepConcatenated array.
function _keepConcatenated(kc, a) {

  // Handle an upwardable object changing, in case of `A(model.obj)`.
  function arrayChanged(_o) {
    replace(kc.objs, o, _o);
    recalc(kc);
  }
  
  upward(o, objectChanged);
  
  function key(v, k) {
    placeKey(kc, v, k);
  }
  
  function update(k, v) {
    processKey(k, v);
  }
  
  function _delete(k) {
    recalc(kc);
  }
  
  var handlers = {
    add: argify(placeKey, kc),
    update: argify(placeKey, kc),
    delete: _delete
  };
  observeObject(o, makeObserver(handlers));
  
  kc.arrays.push(a);
  mapObject(o, (v, k) => placeKey(kc, v, k, pusher));
  return kc;
}

export {
  keepConcatenated
};
