// Upwardable
// ==========

// The heart and soul of the upward library.
// Define An object which remembers its value and can report on changes.

// The behavior of upwardables is as follows:
//
// `a = U([1, 2, 3])` creates an upwardable on an array.
// Therefore, `a[0]` returns an upwardable on 1.
// Its value could be obtained by `+a[0]` or `V(a[0])`.
// However, `a[0]` sets the **underlying value** on that upwardable.
// Such a change is notified as an 'update' on the upwardable.
// It can also be observed as an `'upward'` change on the upwardable.
//
// 

// Convenience.
var {create, keys, assign, getNotifier, observe, unobserve, defineProperty} = Object;
var {set} = Map.prototype;

import {isObject, valueize, mapObject} from './Obj';

// A list of all upwardables. Used to determine upwardified-ness.
var upwardables = new WeakSet();

function isUpwardable(u) {
  return upwardables.has(u);
}

// A list of all objects which have been upwardified.
// Used to prevent creating new upwardifieds on same object.
var upwardifieds = new WeakMap();

// Constructor for upwardable object.
// Skip construction and return an existing upwardable if one exists.
function U(v) {
  var u;

  if (upwardables.has(Object(v))) return v;

  u = upwardifieds.get(Object(v));

  if (!u) {
    u = createUpwardable(v);
    upwardables.add(u);
    upwardifieds.set(Object(v), u);
  }

  return u;
}

// Return string representation of upwardable.
function upwardableToString(u) {
  console.assert(upwardables.has(u), "Cannot stringify non-upwardable object.");
  return `U (='${valueize(u)}')`;
}

// Upwardable prototype. Heavily adorned elsewhere with methods.
var upwardablePrototype = Object.create(null, {
  toString: { value: function() { return upwardableToString(this); } }
});

// Create a new upwardable, a lightweight object with getters and setters
// against an underlying object.
function createUpwardable(target) {
  console.assert(arguments.length === 1, "createUpwardable() takes exactly one argument.");
  console.assert(!isUpwardable(target), "Cannot create upwardable from upwardable.");
  console.assert(isObject(target), "Cannot create upwardable from non-object.");

  // Set up a shadow property on upwardable.
  function upwardifyProperty(name) {
    defineProperty(object, name, {
      set(v) {
        var oldValue;
        const type = 'update';
        [oldValue, target[p]] = [target[p], v];
        notifier.notify({type, object, name, oldValue});
      },
      get()  {
        const type = 'access';
        capturer.notify({type, object, name});
        return target[name];
      },
      enumerable: true
    });
  }
  
  // Observer to handle new or deleted properties on the object.
  function objectObserver(changes) {
    changes.forEach(change => {
      var {type, name} = change;
      switch (type) {
      case 'add':    target[name] = object[name]; break;
      case 'delete': delete target[name];         break;
      }
    });
  }

  // Observer to handle new, deleted or updated properties on the target.
  function targetObserver(changes) {
    changes.forEach(change => {
      var {type, name} = change;
      switch (type) {
      case 'add':    upwardifyProperty(name);     break;
      case 'delete': delete object[name];         break;
      case 'update': object[name] = target[name]; break;
      }
    });
  }
    
  var object = create(upwardablePrototype);
  var notifier = getNotifier(object);
  keys(target).forEach(upwardifyProperty);
  observe(target, targetObserver);
  observe(object, objectObserver);
  return object;
}

function accessObservableUpwardable(u) {
  observe(u, ['access']);
}

// Contexutualization
function contextualize(u, context) {
  return create(u, { context: { value: context } });
}

var capturer = 0;

function makeCapturerManager() {
  var capturers = [];
  return {
    push(c) { capturer = capturers.push(c); },
    pop()   { var c = capturers.pop; capturer = capturers[capturers.length=1]; return c; }
  };
}

var capturerManager = makeCapturerManager();

// Stack of capturer functions; first one is active.
var capturers = [];

function Capturer() {
  var captures = new Set();
  return {
    push(capturer) { captures.clear(); capturers.push(capturer); },
    pop()          { return capturers.pop(); }
  };
}
  
// Computables
// ===========

var computablePrototype = {
  set(v)  { this.value = v; },
  get(v)  { return this.value; },
  valueOf { return this.value; },
  addDependency(objprop) { this.dependencies.add(objprop); }
  
};

function C(fn) {
  var dependencies = new WeakSet();
  var captures = new Map();

  function addCapture({object, name}) {
    var names = captures.get(object);
    if (!names) { names = []; captures.set(object, names); }
    names.push(name);
  }
  
  function run() {
    uninstallObservers();
    installCapturer();
    fn();
    uninstallCapturer();
    installObservers();
  }

  function installObservers() {
    captures.forEach(({object, name}) => {
      observe(object, fdkjdfjkdfjk, 'update');
    });
  }
  
  var c = create(computablePrototype, {
    dependencies: { value: new WeakSet(); },
    value: {
      get() {},
      set(v) { },
    },
  });

  observe(c, run, 'upward');
  return c;
}


function makeCapturer(u, fn) {
  var captures = new Set();
  var observer = changes => getNotifier(u).notify({type: 'upward'});
  var result;
  
  return function run(...args) {
    captures.forEach(capture => unobserve(capture, observer));
    captures.clear();
    {
      capturers.unshift(capture => captures.set(capture));
      result = fn.call(this, ...args);
      capturers.shift();
    }
    captures.forEach(capture => observe(capture, observer));
    return result;
  };
}

export {
  U,
  computedUpwardable,
  isUpwardable,
  upwardCapture,
  upwardablePrototype
};
