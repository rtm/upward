// Observation utilities
// =====================

// Setup
var {keys, create, assign, observe, unobserve} = Object;

// Make an observation handler, given a target and an object of handlers
// with function-valued keys such as "add", "delete", and "update".
var observerPrototype = {
  handle(changes) { 
    changes.forEach(change => {
      var {object, type, name, oldValue} = change;
      this[type](change);
    })
  }
}
  
function makeObserver(handlers) {
	var handler = assign(create(observerPrototype), handlers);
	return handler.handle.bind(handler);
}

// Invoke Object.observe with only the types available to be handled.
function observeObject  (o, handler) { 
	observe  (o, handler, keys(handler)); 
}

function unobserveObject(o, handler) { 
	unobserve(o, handler); 
}
  
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
	makeObserver,
	observeObject,
	unobserveObject,
	keepObjectUpdated
};
