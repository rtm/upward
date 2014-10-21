// Utility array functions
// =======================

// Generate a sequence of integers.
function *seq(to, from = 0) {
  var dir = to > from ? +1 : -1;
  for (var i = from; i != to; i += dir) { yield i; }
}

// Return tail of array.
function tail(a) {
  var [, ...t] = a;
  return t;
}

// Add two things.
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

function makeSortfunc(key, desc) {
  return function(a, b) {
    var akey = key(a), key = key(b);
    var result = akey < bkey ? -1 : akey > bkey ? +1 : 0;
    return desc ? -result : result;
  };
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
  return runningMap(a, plus); 
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

// Allow in-place modifier functions to be applied to array as `this`.
if (!Array.prototype.tail) {
  Object.defineProperties(Array.prototype, {
    tail:      { value()         { return tail(this); } },
    sum:       { value()         { return sum(this); } },
    swap:      { value()         { return swap(this); } },
    append:    { value(...elts)  { return append(this, ...elts); } },
    omit:      { value(elt)      { return omit(this, elt); } },
    uniqueize: { value()         { return uniqueize(this); } }
  });
}

export {
  seq,
  tail,
  sum,
  swap,
  append,
  omit,
  reverse,
  makeSortfunc,
  uniqueize,
  indexesOf,
  runningMap,
  runningTotal,
  filterInPlace,
  makeSortFunc
};
