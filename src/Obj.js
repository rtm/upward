// Object utilities
// ===============

// Setup
var {keys, assign, observe, unobserve} = Object;

// Generic version of `valueOf` which works for anything.
function valueize(v) { return v == null ? v : v.valueOf(); }

// User-friendly representation of an objectd.
function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

function propGetter(v) {
  return function(o) {
    return o[v];
  };
}

function propValueGetter(v) {
  return function(o) {
    return valueize(o[v]);
  };
}  

function thisPropGetter(v) {
  return function() {
    return this[v];
  };
}

// Analog of `Array#map` for objects.
function mapObject(o, fn, ctxt) {
	var result = {};
	for (var [key, val] of objectPairs(o)) {
		result[key] = fn.call(ctxt, val, key, o);
	}
	return result;
}

function mapObjectInPlace(o, fn, ctxt) {
	for (var [key, val] of objectPairs(o)) {
		o[key] = fn.call(ctxt, val, key, o);
	}
  return o;
}

// "Invert" an object.
function invertObject(o) {
	var result = {};
	for ([key, val] of objectPairs(o)) {
		result[val] = key;
	}
	return result;
}

// Analog of `Array#reduce` for objects.
function reduceObject(o, fn, init) {
	for ([key, val] of objectPairs(o)) {
		init = fn(init, val, key, o);
	}
	return init;
}

// Create an object from arrays of keys and values.
function objectFromPairs(keys, vals) {
  var result = {};
  for (let i = 0, len = keys.length; i < len; i++) {
    result[keys[i]] = vals[i];
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
	return path.reduce((ret, seg) => ret && typeof ret === 'object' && ret[seg], o);
}

// Return an aray all of the values of which are evaluated.
function valueArray(a) { return a.map(valueize); }

// Return an array of the object's values.
function objectValues(o) { return keys(o).map(k => o[k]); }

// Generator for object's key/value pairs. Usage: `for ([key, val] of objectPairs(o))`.
function *objectPairs(o) { for (var k in o) {	yield [k, o[k]]; } }

// "Empty" the object, optionally keeping structure of subobjects with `{keep: true}` option.
// Numbers turn to zero, booleans to false, arrays are emptied, etc.
function emptyObject(o, {keep = {}}) {
  for (var [k, v] of objectPairs(o)) {
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
  objectToString,
  propGetter,
  propValueGetter,
  thisPropGetter,
  mapObject,
  mapObjectInPlace,
  invertObject,
  reduceObject,
  objectFromPairs,
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

