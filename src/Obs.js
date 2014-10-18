// Observation utilities
// =====================

// Setup
var {keys, create, assign, observe, unobserve} = Object;

// Make an observation handler, given a target and an object of handlers
// with function-valued keys such as "add", "delete", and "update".
var observerPrototype = {
  handle(changes) {
    changes.forEach(change => this[change.type](change))
	}
};

// Make an observer from a hash of handlers for observation types.
// This observer can be passed to `observeObject`.  
function makeObserver(handlers) {
	var handler = assign(create(observerPrototype), handlers);
	var observer = handler.handle.bind(handler);
	observer.keys = keys(handlers);
	return observer;
}

// Invoke Object.observe with only the types available to be handled.
function observeObject(o, observer) { 
	console.log("adding handler to", o, observer, observer.keys);
	observe (o, observer, observer.keys);
}

function unobserveObject(o, observer) { 
	unobserve(o, observer); 
}
  
// Keep an object in sync with another.
function mirrorProperties(src, dest = {}) {
	function set(name) { dest[name] = src[name]; }
	function _delete(name) { delete dest[name]; }
	
	var handlers = { add: set, update: set, delete: _delete};
	
	assign(dest, src);
	observe(src, makeObserver(handlers));
	return dest;
}

export {
	makeObserver,
	observeObject,
	unobserveObject,
	mirrorProperties
};
