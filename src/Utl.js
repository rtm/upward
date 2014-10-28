// Utility functions
// =================

// Setup.
import {mapObject} from './Obj';
import {fixed} from './Fun';

var {create} = Object;
    
// Create an array of a sequence of integers.
function seq(to, from = 0, step = 1) {
  var dir = to > from ? +1 : -1;
  var result = [];
  for (let i = from, count = 0; i != to; i += dir, count++) {
    result[count] = i;
  }
  return result;
}

// Return tail of array.
function tail(a) {
  var [, ...t] = a;
  return t;
}

function plus(a, b) {
  return a + b;
}

// Sum (or concatenate) elements of array
function sum(a) {
  return a.reduce(plus);
}

// Swap the elements of a tuple in place.
function swap(a) {
  [a[1], a[2]] = a;
}

// Append to an array, returning the array.
function append(a, ...elts) {
  a.push(...elts);
  return a;
}

// Omit elements from array destructively.
function omit(a, elt) {
  var index = a.indexOf(elt);
  if (index !== -1) {
    a.splice(index, 1);
  }
  return a;
}

// Replace one element in an array with another.
function replace(a, elt1, elt2) {
  var idx = a.indexOf(elt1);
  if (idx !== -1) { a[idx] = elt2; }
  return a;
}

// reverse an array in place
function reverse(a) {
  var len = a.length;
  for (var i = 0; i < Math.floor(len/2); i++) {
    [a[i], a[len-i-1]] = [a[len-i-1], a[i]];
  }
  return a;
}

function mapInPlace(a, fn, ctxt) {
  for (var i = 0, len = a.length; i < len; i++) {
    a[i] = fn.call(ctxt, a[i]);
  }
  return a;
}

function repeat(n, v) {
  return seq(n).fill(v);
}

// Create a sort function suitable for passing to `Array#sort`.
function makeSortfunc(key, desc) {
  return function(a, b) {
    var akey = key(a), bkey = key(b);
    var result = akey < bkey ? -1 : akey > bkey ? +1 : 0;
    return desc ? -result : result;
  };
}

// Copy an array into another one destructively
function copyOnto(a1, a2) {
  for (let i = 0; i < a1.length; i++) {
    a2[i] = a1[i];
  }
  a2.length = a1.length;
  return a2;
}

// Create an array of unique values.
function uniqueize(a) {
  return a.filter((elt, i) => a.indexOf(elt) === i);
}

// Find all occurrences of element in an array, return indices.
// @NOTUSED
function indexesOf(a, elt) {
  var ret = [], index = 0;
  while ((index = a.indexOf(elt, index)) !== -1) {
    ret.push(index++);
  }
  return ret;
}

// Create an array of running totals, etc.
function runningMap(a, fn, init) { 
  return a.map(v => init = fn(v, init)); 
}

// Create an array of running totals.
function runningTotal(a) { 
  return runningMap(a, Math.sum); 
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

// Chain fns together using promises.
function chainPromises(...fns) {
  return [...fns].reduce(
    (result, fn) => result.then(fn),
    Promise.resolve()
  );
}

// Stopwatch: start and stop, then retrieve elapsed time.
// Start and stop return input, to make them friendly to promise chaining.
// Start, stop and reset are pre-bound to the stopwatch itself.
var stopwatchPrototype = create({
  start(val) { this.started = Date.now(); this.stopped = false; return val; },
  stop (val) { this.elapsed = this.time;  this.stopped = true;  return val; },
  reset(val) { this.elapsed = 0;          this.stopped = true;  return val; },
  stopped:   true,
  elapsed:   0
}, {
  current:   { get: function() { return this.stopped ? 0 : Date.now() - this.started; } },
  time:      { get: function() { return this.elapsed + this.current; } }
});

function makeStopwatch() {
  var stopwatch = create(stopwatchPrototype);
  ['start', 'stop', 'reset'].forEach(
    method => stopwatch[method] = stopwatch[method].bind(stopwatch));
  return stopwatch;
}

var prototypeFns = {
  tail, sum, swap, append, replace, mapInPlace, omit, copyOnto, uniqueize,
  indexesOf, runningMap, runningTotal, filterInPlace, chainPromises
};

// Allow in-place modifier functions to be applied to array as `this`.
if (!Array.prototype.tail) {
  Object.defineProperties(
    Array.prototype,
    mapObject(prototypeFns, v => (
      { value(...args) { return v(this, ...args); } }
    ))
  );
}

export {
  seq,
  tail,
  plus,
  sum,
  swap,
  append,
  omit,
  replace,
  reverse,
  mapInPlace,
  repeat,
  makeSortfunc,
  copyOnto,
  uniqueize,
  indexesOf,
  runningMap,
  runningTotal,
  filterInPlace,
  chainPromises,
  makeSortFunc,
  makeStopwatch
};
