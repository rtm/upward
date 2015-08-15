// Utility functions
// =================

import {testGroup, test, assert} from './Tst';
import {objectFromPairs} from './Out';

// Setup.
var {create, keys} = Object;

var tests = [];
var TEST = true;


// Create an array of a sequence of integers.
function seq(to, from = 0, step = 1) {
  var result = [];
  var count = 0;
  if (to > from) for (let i = from; i < to; i += step) result[count++] = i;
  else           for (let i = from; i > to; i -= step) result[count++] = i;

  return result;
}

if (TEST) {
  function tstSeq() {
    return testGroup(
      "seq",
      [
        test("simple sequence",    ({assert}) => assert.deepEqual(seq(2),       [0, 1])),
        test("sequence with from", ({assert}) => assert.deepEqual(seq(3, 1),    [1, 2])),
        test("stepped sequence",   ({assert}) => assert.deepEqual(seq(3, 0, 2), [0, 2])),
        test("reverse sequence",   ({assert}) => assert.deepEqual(seq(0, 2),    [2, 1]))
      ]
    );
  }
  tests.push(tstSeq);
}


// Return tail of array.
function tail(a) {
  var [, ...t] = a;
  return t;
}

if (TEST) {
  function tstTail() {
    return testGroup(
      "tail", [
        test("normal",         ({assert}) => assert.deepEqual(tail([1,2]), [2])),
        test("single element", ({assert}) => assert.deepEqual(tail([1]),   [])),
        test("empty array",    ({assert}) => assert.deepEqual(tail([]),    []))
      ]
    );
  }
  tests.push(tstTail);
}


function plus(a, b) {
  return a + b;
}

if (TEST) {
  function tstPlus() {
    return test("plus", ({assert}) => assert.equal(plus(1, 2), 3));
  }
  tests.push(tstPlus);
}

// Sum (or concatenate) elements of array
function sum(a) {
  return a.reduce(plus);
}

function arrayMax(a) {
  return Math.max(...a);
}

function arrayMin(a) {
  return Math.min(...a);
}

function arrayMean(a) {
  return sum(a) / a.length;
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

// Flatten an array.
function flatten(a) {
  function _reduce(a) { return a.reduce(_flatten, []); }

  function _flatten(a, b) {
    return a.concat(Array.isArray(b) ? _reduce(b) : b);
  }

  return _reduce(a);
}

if (TEST) {
  tests.push(() => testGroup(
    "flatten",
    [
      test(
        "simple flatten",
        ({assert}) => assert.deepEqual(
          flatten([[1, 2], [3, 4]]),
          [1, 2, 3, 4]
        )
      ),
      test(
        "deep flatten",
        ({assert}) => assert.deepEqual(
          flatten([1, [2, [3, [4]]]]),
          [1, 2, 3, 4]
        )
      )
    ]
  ));
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

// Copy a second array onto a first one destructively.
function copyOntoArray(a1, a2) {
  for (let i = 0; i < a1.length; i++) {
    a1[i] = a2[i];
  }
  a1.length = a2.length;
  return a1;
}

// Create an array of unique values.
// @TODO replace this logic using Set.
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

// Interleave an element into an array (adding at end too).
function interleaveElement(a1, elt) {
  return [].concat(...a1.map(v => [v, elt]));
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

// Make a counter for occurrences of something on an object, using weak map.
// For example, used to count recomputations of "keepXXX" results.
function makeCounterMap() {
  var map = new WeakMap();
  return {
    init(obj) { map.set(obj, 0); },
    incr(obj) {
      console.assert(map.has(obj), "Object must be in counter map.");
      map.set(obj, map.get(obj) + 1);
    },
     get(obj)  { return map.get(obj); }
  };
}

// Interleave multiple arrays.
function interleave(...arrays) {
  var more = true;
  var n = 0;
  var result = [];
  while (more) {
    more = false;
    for (var array of arrays) {
      if (n >= array.length) continue;
      result.push(array[n]);
      more = true;
    }
    n++;
  }
  return result;
}

// Generator for interleaved values from multiple iteratables.
function *interleaveIterables(...iterables) {
  var more = true;
  while (more) {
    more = false;
    for (var it of iterables) {
      var {done, value} = it.next();
      if (done) continue;
      more = true;
      yield value;
    }
  }
}

// URL-RELATED UTILITIES
// ---------------------

// Parse a search string into an object.
function parseUrlSearch(search) {
  if (search[0] === '?') search = search.slice(1);

  function splitParam(param) {
    var [key, value = ''] = param.split('=');
    return [key, decodeURIComponent(value)];
  }

  return objectFromPairs(search . split('&') . map(splitParam));
}

if (TEST) {
  tests.push(function tstParseUrlSearch() {
    return testGroup("parseUrlSearch", [
      test("base case", ({assert}) => assert.deepEqual(parseUrlSearch('a=1&b=2'), {a: "1", b: "2"}))
    ]);
  });
}

// Build a search string (with no ?) from an object.
function buildUrlSearch(query) {

  function buildParam(key) {
    let value = query[key];
    if (value === null || value === undefined) value = '';
    else value = encodeURIComponent(value);
    return `${key}=${value}`;
  }

  return keys(query) . map(buildParam) . join('&');
}

if (TEST) {
  tests.push(function tstBuildUrlSearch() {
    return testGroup("buildUrlSearch", [
      test("base case", ({assert}) => assert.equal(buildUrlSearch({a: 1, b: 2}), 'a=1&b=2'))
    ]);
  });
}

var prototypeFns = {
  tail, sum, swap, append, replace, mapInPlace, omit, copyOntoArray, uniqueize,
  indexesOf, interleave, runningMap, runningTotal, filterInPlace, chainPromises
};

// Allow in-place modifier functions to be applied to array as `this`.
// if (!Array.prototype.tail) {
//   Object.defineProperties(
//     Array.prototype,
//     mapObject(prototypeFns, v => (
//       { value(...args) { return v(this, ...args); } }
//     ))
//   );
// }


// Exported function to Create test group.
function utlTestGroup() {
  return testGroup("module Utl (general utilities)", tests.map(test => test()));
}

export {
  seq,
  tail,
  plus,
  sum,
  arrayMax,
  arrayMin,
  arrayMean,
  swap,
  append,
  omit,
  replace,
  reverse,
  flatten,
  mapInPlace,
  repeat,
  makeSortfunc,
  copyOntoArray,
  uniqueize,
  indexesOf,
  interleaveElement,
  runningMap,
  runningTotal,
  filterInPlace,
  chainPromises,
  makeStopwatch,
  makeCounterMap,
  interleave,
  interleaveIterables,

  parseUrlSearch,
  buildUrlSearch,

  utlTestGroup as tests
};
