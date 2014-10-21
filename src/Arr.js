import {observeObject, makeObserver} from '../src/Obs';
import {tickify, logify, swapify} from '../src/Fun';
import {upwardCapture, upward, unupward, upwardablePrototype} from './upward';
import {sum, reverse} from './Utl';
import {valueOf, mapObject} from './Obj';

var {observe, splice} = Array;
var {keys, defineProperty, defineProperties} = Object;

// Create a mapped array which is kept in sync via observation.
// Replace changed values, delete deleted values, and mirror splices.
function keepMapped(a, fn, ctxt) {

  var result = [];
  var upwardMaps = [];

  function update(v, i, a) {
    result[i] = fn.call(ctxt, v, i, a);
  }
  
  function _upward  (map) { (map || []).forEach(swapify(upward  )); }
  function _unupward(map) { (map || []).forEach(swapify(unupward)); }
  
  function add(v, i, a) {
    _unupward(upwardMaps[i]);
    var [ret, map] = upwardCapture(() => update(a[i], i, a));
    map.forEach(key => map.set(key, v => update(v, i, a)));
    _upward(upwardMaps[i] = map);
    return result[i] = ret;
  }

  function setup() {
    upwardMaps.forEach(_unupward);
    valueOf(a).forEach(setOne);
  }
  setup();
  
  upward(a, setup);

  var handler = {
    add: signaturize(_add),
    update: signaturize(_update),
    delete({name: i}) {
      _unupward(upwardMaps[i]);
      delete result[i];
    },
    splice({object, index, removed, addedCount}) {
      var added = object.slice(index, index + addedCount).map(fn, ctxt);
      result.splice(index, removed.length, ...added);
    }
  };
  
  observe(a, makeObserver(handler));
  return result;
}

// Keep an array sliced as it changes.
function keepSliced(a, from, to) {
  var result = [];

  function doit() {
    for (i = from; i < to; i++) {
      result[i - from] = a[i];
    }
    
  }
}

// Keep an array in original, or reversed order.
function keepReversed(a, up) {
  var result = [];

  // Array has changed; switch to new one and recalc.
  function changeArray(_a) {
    Array.unobserve(a, observer);
    a = _a;
    set();
    Array.observe(a, observer);
  }

  // Direction has changed; recalc.
  function changeUp(_up) {
    if (up === _up) { return; }
    up = _up;
    set();
  }
    
  // Calculate corresponding position in possible reversed array.
  function pos(i) {
    return up ? i : a.length - 1 - i;
  }

  // Set the elements in place.
  function set() {
    var len = a.length;
    for (let i = 0; i < len; i++) {
      result[i] = a[pos(i)];
    }
    result.length = len;
  }
  
  // Watch for changes in array or direction.
  upward(up, changeUp);
  upward(a,  changeArray);
  
  var handlers = {
    update({name}) { result[pos(name)] = a[name]; },
    splice ({index, removed, addedCount}) {
      var added = a.slice(index, index + addedCount);
      if (up) {
        result.splice(index, removed.length, ...added);
      } else {
        result.splice(pos(index) - removed.length, removed.length, ...added.reverse());
      }
    }
  };

  a  = valueOf(a);
  up = valueOf(up);

  var observer = makeObserver(handlers);
  set();
  Array.observe(a, observer);
  return result;
}

// Order an array and keep it ordered as things change.
function keepOrdered(a, order) { 
  return keepMapped(order, i => a[i]); 
}

// Return a filtered array which is kept up to date.
function keepFiltered(a, fn, ctxt) {

  var result = a.filter(fn, ctxt);
  var filter = keepMapped(a, fn, ctxt);

  function capture() {
    var [, upwardSet] = upwardCapture(filter);
    for (var u in upwardSet) { upward(u, filter); }
  }

  function getpos(i) {
    return sum(filter.slice(0, i+1));
  }
  
  var handlers = {
    add({name}) { 
      var val = a[name];
      if (fn.call(ctxt, val, name, a)) { result[name] = val; }
    },
    update({name}) {
      var val = a[name];
      var p = fn.call(ctxt, val, name, a);
      if (p) { a.splice(getpos(name), 0, val); }
      else { a.splice(name, 1); }
    },
    splice({object, index, removed, addedCount}) {
      var added = a.slice(index, index + addedCount).filter(fn, ctxt);
      object.splice(
        getpos(name),
        sum(removed.map(fn, ctxt).map(Boolean)),
          ...added
      );
    }
  };

  // Watch for changes in parallel array of bools.
  observe(filters, makeObserver(handlers));
  
  var result;
  capture();

  // Watch for changes to filtering criteria.
  upward(fn, capture);
  return result;
}

function makeSortfunc(key, order) {
  return function(a, b) {
    var akey = key(a), key = key(b);
    var result = akey < bkey ? -1 : akey > bkey ? +1 : 0;
    return order ? result : -result;
  };
}

function keepSorted(a, key = identity, order = true) {

  function sortCapture() {
    var [, upwardSet] = upwardCapture(sort);
    for (var u in upwardSet) { upward(u, sort); }
  }

  function sort() { 
    a.sort(makeSortfunc(valueOf(key), valueOf(order))); 
  }
  
  // Watch for changes in array values.
  // @TODO: check to see if updates/adds are already in correct order
  var handlers = { update: sortRecapture, add: sortRecapture };
  observeObject(filter, makeObserver(handlers));

  sortCapture();

  // Watch for changes to key and order.
  upward(key, sortRecapture);
  upward(order, sort);

  return a;
}

// Filter an array in place, based on predicate with same signature as `Array#filter`.
function filterInPlace(a, fn, ctxt) {
  for (var i = 0; i < a.length; i++) {
    if (!fn.call(ctxt, a[i], i, a)) {
      a.splice(i--, 1); 
    }
  }
  return a;
}

// Maintain an array in unique state.
function keepUnique(a) {
  function isUnique(elt, i, a) { return !i || a.lastIndexOf(elt, i-1) === -1; }
  function check({name: i})    { if (i !== 'length' && !isUnique(a[i])) { a.splice(i, 1); } }

  var handlers = { update: check, add: check };

  filterInPlace(a, isUnique);
  observeObject(a, makeObserver(handlers));
  return a;
}

// Place the methods on the Array and Upwardable prototype.
var methodMap = {
  as: keepMapped,
  by: keepSorted,
  if: keepFiltered,
  of: keepSliced,
  up: keepReversed
};

var arrayProtoMunged = "__UPWARD_METHODS";

var methodDescriptors = mapObject(methodMap, v => ({
  value(...args) { return v(this, ...args); }})
);

if (!Array.prototype[arrayProtoMunged]) {
  [
    Array.prototype,
    upwardablePrototype
  ]
    .forEach(
      proto => defineProperties(proto, methodDescriptors)
    )
  ;
  defineProperty(Array.prototype, arrayProtoMunged, {value: true});
}
    
export {
  keepMapped,
  keepSorted,
  keepFiltered,
  keepSliced,
  keepReversed
};

