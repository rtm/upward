// Object utilities
// ===============

// Setup
var {keys} = Object;

// Generic version of `valueOf` which works for anything.
function valueOf(v) {
    return v == null ? v : v.valueOf();
}

// User-friendly representation of an objectd.
function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

// Analog of `Array#map` for objects.
function mapObject(o, fn, ctxt) {
  return keys(o).reduce(
		(result, k) => {
			result[k] = fn.call(ctxt, o[k], k, o);
			return result;
		}, {});
}

// Return an object all of the values of which are evaluated.
function valueOfObject(o) {
  return mapObject(o, valueOf);
}

// Return an aray all of the values of which are evaluated.
function valueArray(a) {
  return a.map(valueOf);
}

// Return an array of the object's values.
function objectValues(o) {
  return keys(o).map(k => o[k]);
}

// Generator for object's key/value pairs.
function *objectPairs(o) {
  keys(o).forEach(k => yield [k, o[k]]);
}

// "Empty" the object, optionally keeping structure of subobjects.
function emptyObject(o, {keep = {}}) {
  for (var [k, v] of objectPairs(o)) {
    var ctor = v && v.constructor;
    if (keep && ctor === Object) emptyObject(v);
    else o[k] = ctor && ctor();
  });
}

export {
  objectToString,
  mapObject,
  valueOfObject,
  valueArray,
  objectValues,
	valueOf,
  emptyObject
};

