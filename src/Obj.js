// Object utilities
// ===============

// Setup
var {keys, assign, observe, unobserve} = Object;

// Generic version of `valueOf` which works for anything.
function valueOf(v) { return v == null ? v : v.valueOf(); }

// User-friendly representation of an objectd.
function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

// Analog of `Array#map` for objects.
function mapObject(o, fn, ctxt) {
	var result = {};
	for ([key, val] of objectPairs(o)) {
		result[key] = val;
	}
	return result;
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

// Return an object all of the values of which are evaluated.
function valueOfObject(o) { return mapObject(o, valueOf); }

// Get a value down inside an object, based on a "path" (array of property names).
function valueFromPath(o, path = []) {
	return path.reduce((ret, seg) => ret && typeof ret === 'object' && ret[seg], o);
}

// Return an aray all of the values of which are evaluated.
function valueArray(a) { return a.map(valueOf); }

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

// Keep an object in sync with another.
function keepObjectUpdated(src, dest = {}) {
	function set(name) { dest[name] = src[name]; }
	function _delete(name) { delete dest[name]; }
	
	var handlers = { add: set, update: set, delete: _delete};
	
	assign(dest, src);
	observe(src, makeObserver(handlers));
	return dest;
}

// Combine objects a la `Object.assign`, but also for subobjects.
function nestedAssign(...args) {
  return args.reduce(
		(ret, arg) => {
			keys(arg).forEach(
				k => {
					var val = arg[k];
					if (k in ret && typeof ret[k] === 'object' && val &&typeof val === 'object') {
						Object.assign(ret[k], val);
					} else {
						ret[k] = val;
					}
				});
			return ret;
		},
		{}
	);
}

function observingAssign(args) {
	
}

export {
  objectToString,
  mapObject,
  valueOfObject,
  valueArray,
  objectValues,
	valueOf,
  emptyObject,
	valueFromPath
};

