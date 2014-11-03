// Observation utilities
// =====================

// Setup.
// This module has no dependencies; please keep it that way.
var {keys, create, assign, observe, unobserve} = Object;

// Make an observation handler, given a target and an object of handlers
// with function-valued keys such as "add", "delete", and "update".
// Keys of the form `type_name`, such as `update_a`, may also be given.
// Map the signature to match `Array#forEach`, with changerec as 4th arg.
// After all changes are handled, the 'end' hook is called.
var observerPrototype = {
  handle(changes) {
    var saveObject;
    changes.forEach(change => {
      let {type, object, name} = change;
      // If handler includes a method named `type_name`, use that.
      let fn = this[type + '_' + name] || this[type] || (_ => undefined);
      saveObject = object;
      //      if (type === 'update' && name === 'length') { type = 'length'; }
      fn(object[name], name, object, change);
    });
    if (this.end) { this.end(saveObject); }
  }
};

// This version of observerPrototype handles the change objects asynchronously,
// allowing them to return promises.
// However, it doesn't work right now, at least not in a testing context.
var asyncObserverPrototype = {
  handle(changes) {
    var saveObject;
    spawn(function *() {
      for (var change of changes) {
        let {type, object, name} = change;
        var fn = this[type];
        saveObject = object;
        if (fn) { yield fn (object[name], name, object, change); }
      }
      if (this.end) { yield this.end(saveObject); }
    });
  }
};

// Prepare the list of `type`s to pass to O.o, based on handler methods.
// Even if only `end` is present, we need to add `add` etc.
// If handler named `type_name` is there, register `type` as handled.
function getTypesFromHandlers(handlers) {
  var types = keys(handlers);
  types = types.map(k => k.replace(/_.*/, ''));
  if (types.indexOf('end') !== -1) {
    types.push('add', 'update', 'delete');
  }
  return types;
}

// Make an observer from a hash of handlers for observation types.
// This observer can be passed to `observeObject`.  
function makeObserver(handlers) {
  console.assert(handlers && typeof handlers === 'object', "Argument to makeObserver must be hash.");
  var handler = assign(create(observerPrototype), handlers);
  var observer = handler.handle.bind(handler);
  observer.keys = getTypesFromHandlers(handlers);
  return observer;
}

// Invoke Object.observe with only the types available to be handled.
function observeObject(o, observer) {
  return o && typeof o === 'object' && return observe(o, observer, observer.keys);
}

function observeObjectNow(o, observer) {
  observeObject(o, observer);
  notifyRetroactively(o);
  return o;
}

// Unobserve something obseved with `observeObject`.
function unobserveObject(o, observer) { 
  return o && typeof o === 'object' && unobserve(o, observer); 
}

// Retroactively notify 'add' to all properties in an object.
function notifyRetroactively(object) {
  if (object && typeof object === 'object') {
    const type = 'add';
    var notifier = Object.getNotifier(object);
    keys(object).forEach(name => notifier.notify({type, name, object}));
  }
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
