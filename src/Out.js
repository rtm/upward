// Object utilities
// ===============

// Setup. No dependencies, and keep it that way.
var {keys, assign, observe, unobserve} = Object;

function isObject(o) {
  return o && typeof o === 'object';
}

// Generic version of `valueOf` which works for anything.
function valueize(v) { return isObject(v) ? v.valueOf() : v; }

// User-friendly representation of an object.
function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

// Make functions to return properties, in various flavors.
function propGetter         (v) { return o => o[v]; }
function propValueGetter    (v) { return o => valueize(o[v]); }
function thisPropGetter     (v) { return function() { return this[v]; }; }
function thisPropValueGetter(v) { return function() { return valueize(this[v]); }; }

// Analog of `Array#map` for objects.
function mapObject(o, fn, ctxt) {
  var result = {};
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      result[key] = fn.call(ctxt, o[key], key, o);
    }
  }
  return result;
}

// Map an object's values, replacing existing ones.
function mapObjectInPlace(o, fn, ctxt) {
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      o[key] = fn.call(ctxt, o[key], key, o);
    }
  }
  return o;
}

// Make a copy of something.
function copyOf(o) {
  if (Array.isArray(o)) return o.slice();
  if (isObject(o)) return assign({}, o);
  return o;
}

// Copy a second array onto a first one destructively.
function copyOntoArray(a1, a2) {
  for (let i = 0; i < a2.length; i++) {
    a1[i] = a2[i];
  }
  a1.length = a2.length;
  return a1;
}

// Overwrite a first object entirely with a second one.
function copyOntoObject(o1, o2) {
  assign(o1, o2);
  keys(o1)
    .filter(key => !(key in o2))
    .forEach(key => (delete o1[key]));
  return o1;
}

// Copy a second object or array destructively onto a first one.
function copyOnto(a1, a2) {
  if (Array.isArray(a1) && Array.isArray(a2)) return copyOntoArray (a1, a2);
  if (isObject     (a1) && isObject     (a2)) return copyOntoObject(a1, a2);
  return (a1 = a2);
}

// "Invert" an object, swapping keys and values.
function invertObject(o) {
  var result = {};
  for (let pair of objectPairs(o)) {
    let [key, val] = pair;
    result[val] = key;
  }
  return result;
}

// Analog of `Array#reduce` for objects.
function reduceObject(o, fn, init) {
  for (let pair of objectPairs(o)) {
    let [key, val] = pair;
    init = fn(init, val, key, o);
  }
  return init;
}

// Create an object from two arrays of keys and values.
function objectFromLists(keys, vals) {
  var result = {};
  for (let i = 0, len = keys.length; i < len; i++) {
    result[keys[i]] = vals[i];
  }
  return result;
}

// Create an object from a list of `[key, val]` pairs.
function objectFromPairs(pairs) {
  var result = {};

  for (let i = 0, len = pairs.length; i < len; i++) {
    let pair = pairs[i];
    result[pair[0]] = pair[1];
  }

  return result;
}


// Create a value-only property descriptors object from an object.
function makePropertyDescriptors(o) {
  return mapObject(o, v => ({ value: v }));
}

// Return an object all of the values of which are evaluated.
function valueizeObject(o) { return mapObject(o, valueize); }

// Get a value down inside an object, based on a "path" (array of property names).
function valueFromPath(o, path = []) {
  return path.reduce((ret, seg) => isObject(ret) && ret[seg], o);
}

// Return an aray all of the values of which are evaluated.
function valueArray(a) { return a.map(valueize); }

// Return an array of the object's values.
function objectValues(o) { return keys(o).map(k => o[k]); }

// Generator for object's key/value pairs. Usage: `for ([key, val] of objectPairs(o))`.
function *objectPairs(o) {
  for (var k in o) {
    if (o.hasOwnProperty(k)) { yield [k, o[k]]; }
  }
}

// "Empty" the object, optionally keeping structure of subobjects with `{keep: true}` option.
// Numbers turn to zero, booleans to false, arrays are emptied, etc.
function emptyObject(o, {keep}) {
  keep = keep || {};
  for (let pair of objectPairs(o)) {
    let [k, v] = pair;
    var ctor = v && v.constructor;
    if (keep && ctor === Object) emptyObject(v);
    else o[k] = ctor && ctor();
  }
}

// Create a function which combines properties from two objects using a function.
// If the property doesn't exist in the first object, just copy.
function makeAssigner(fn) {
  return function(o1, o2) {
    assign(o1, mapObject(o2, (v, k) => o1.hasOwnProperty(k) ? fn(o1[k], v) : v));
  };
}

// Add the values of properties in one array to the same property in another.
var assignAdd = makeAssigner((a, b) => a + b);

export {
  isObject,
  objectToString,

  propGetter,
  propValueGetter,
  thisPropGetter,
  thisPropValueGetter,

  mapObject,
  mapObjectInPlace,

  copyOf,
  copyOntoObject,
  copyOnto,
  copyOntoArray,

  invertObject,
  reduceObject,
  objectFromPairs,
  objectFromLists,

  makePropertyDescriptors,
  valueizeObject,
  valueFromPath,
  valueArray,
  objectValues,
  valueize,
  emptyObject,
  makeAssigner,
  assignAdd
};
