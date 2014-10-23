// Observation utilities
// =====================

// Setup
var {keys, create, assign, observe, unobserve} = Object;

// Make an observation handler, given a target and an object of handlers
// with function-valued keys such as "add", "delete", and "update".
// Map the signature to match `Array#forEach`, with changerec as 4th arg.
// After all changes are handled, the 'end' hook is called.
var observerPrototype = {
  handle(changes) {
    var saveObject;
    changes.forEach(change => {
      let {type, object, name} = change;
      saveObject = object;
      this[type](object[name], name, object, change);
    });
    if (this.end) { this.end(saveObject); }
	}
};

// Make an observer from a hash of handlers for observation types.
// This observer can be passed to `observeObject`.  
function makeObserver(handlers) {
  console.assert(handlers && typeof handlers === 'object', "Argument to makeObserver must be hash.");
	var handler = assign(create(observerPrototype), handlers);
	var observer = handler.handle.bind(handler);
	return observer;
}

// Invoke Object.observe with only the types available to be handled.
function observeObject(o, observer) { 
	return observe (o, observer, keys(observer));
}

function observeObjectNow(o, observer) {
  observeObject(o, observer);
  notifyRetroactively(o);
  return o;
}

// Unobserve something obseved with `observeObject`.
function unobserveObject(o, observer) { 
	return unobserve(o, observer); 
}

// Retroactively notify 'add' to all properties in an object.
function notifyRetroactively(object) {
  const type = 'add';
  var notifier = Object.getNotifier(o);
  kyes(object).forEach(name => notifier.notify({type, name, object});
  return object;
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
	observeObjectNow,
	unobserveObject,
  notifyRetroactively,
	mirrorProperties
};
