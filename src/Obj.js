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

function objectValues(o) {
  return keys(o).map(k => o[k]);
}

export {
  objectToString,
  mapObject,
  valueOfObject,
  valueArray,
  objectValues,
	valueOf
};

