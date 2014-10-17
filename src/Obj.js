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
  return keys(o).reduce(
		(result, k) => {
			result[k] = fn.call(ctxt, o[k], k, o);
			return result;
		}, {});
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

// Make an observation handler, given a target and an object of handlers
// with function-valued keys such as "add", "delete", and "update".
var observationHandlerPrototype = {
  handle(changes) { 
    changes.forEach(change => {
      var {object, type, name, oldValue} = change;
      this[type](name, object, oldValue);
    })
  }
}
  
function makeObservationHandler(handlers) {
  return assign(create(observationHandlerPrototype), handlers).handle;
}

// Invoke Object.observe with only the types available to be handled.
function observeObject  (o, handler) { observe  (o, handler, keys(handler)); }
function unobserveObject(o, handler) { unobserve(o, handler); }
  
// Keep an object in sync with another.
function keepObjectUpdated(src, dest = {}) {
	function set(name) { dest[name] = src[name]; }
	function _delete(name) { delete dest[name]; }
	
	var handlers = { add: set, update: set, delete: _delete};
	
	assign(dest, src);
	observe(src, makeObservationHandler(handlers));
	return dest;
}

export {
  objectToString,
  mapObject,
  valueOfObject,
  valueArray,
  objectValues,
	valueOf,
  emptyObject,
	valueFromPath,

	makeObservationHandler,
	observeObject,
	unobserveObject
};

