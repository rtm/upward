// keepAssigned
// ============

// Define an object composed of multiple objects, which keeps itself updated.
// Addition objects can be added with `and` and `or`.
// Also handles subobjects.

// Convenience.
import {upwardConfig, upwardableId}   from './Cfg';
import {argify}                       from './Ify';
import {makeObserver, observeObject}  from './Obs';
import {isObject, valueize, mapObject, propGetter} from './Out';
import U                              from './Upw';
import {replace}                      from './Utl';

var {create, assign, defineProperty} = Object;
var {push, unshift} = Array.prototype;

// Create the `keepAssigned` object.
function keepAssigned(...objs) {
  var ka = create(keepAssignedPrototype);
  defineProperty(ka, 'objs', { value: [] }); // first-come first-served
  [...objs].forEach(o => _keepAssigned(ka, o));
  return ka;
}

// Return property's value from the first object in which it appears.
function findFirstProp(objs, p) {
  for (let obj of objs) {
    if (obj && obj.hasOwnProperty(p)) { return valueize(obj[p]); }
  }
}

// Calculate value for a property, recursively.
function calcProp(ka, p) {
  var val = ka[p];
  if (isKeepAssigned(val)) {
    recalc(val);
  } else {
    val.val = findFirstProp(ka.objs, p);
  }
}

// Place a key in the kept object.
function placeKey(ka, v, k, pusher) {
  if (isObject(v)) {
    if (k in ka) {
      _keepAssigned(ka[k], v, pusher);
    } else {
      ka[k] = subKeepAssigned(ka.objs, k, pusher);
    }
  } else {
    if (k in ka) {
      ka[k].val = calcProp(ka, k);
    } else {
      defineProperty(ka, k, {
        get() { return U(findFirstProp(ka.objs, k)); },
        enumerable: true
      });
      //upward(v, ka[k]);
    }
  }
}

// Recalculate values for all keys, as when an object changes.
function recalc(ka) {
  for (let [key, val] of objectPairs(ka)) {
    if (isKeepAssigned(val)) { recalc(val); }
    else { val.val = getter(key); }
  }
}

// Make a keepAssigned object for subobjects with some key.
function subKeepAssigned(objs, k, pusher) {
  var ka = keepAssigned();
  objs
    .map(propGetter(k))
    .filter(Boolean)
    .forEach(o => _keepAssigned(ka, o, pusher));
  return ka;
}

// Push one object onto a keepAssigned object, either at the front or back.
function _keepAssigned(ka, o, pusher = unshift) {

  // Handle an upwardable object changing, in case of `O(model.obj)`.
  function objectChanged(_o) {
    replace(ka.objs, o, _o);
    recalc(ka);
  }

  // @TODO: figure out how to handle this.
  //  upward(o, objectChanged);

  function key(v, k) {
    placeKey(ka, v, k);
  }

  function update(k, v) {
    processKey(k, v);
  }

  function _delete(k) {
    recalc(ka);
  }

  var handlers = {
    add: argify(placeKey, ka),
    update: argify(placeKey, ka),
    delete: _delete
  };
  observeObject(o, makeObserver(handlers));

  pusher.call(ka.objs, o);
  mapObject(o, (v, k) => placeKey(ka, v, k, pusher));
  return ka;
}

// Prototype of keepAssigned objects; define `and` and `or`.
var keepAssignedPrototype = {
  and(o) { return _keepAssigned(this, o, unshift); },
  or (o) { return _keepAssigned(this, o, push   ); }
};

// Is something a `keepAssigned` object?
function isKeepAssigned(o) {
  return keepAssignedPrototype.isPrototypeOf(o);
}

export default keepAssigned;
export {isKeepAssigned}; //needed?
