// Computable
// ==========

// The **ccomputable** is one of the two key components of the upward library,
// along with the **upwardable**.
// A **computable** is an enhanced function which recomputes itself
// when its inputs change.

// Convenience.
var {create, assign, getNotifier, observe, unobserve, defineProperty} = Object;
var {set} = Map.prototype;

// A set of all computables.
var computables = new WeakSet();

function isComputable(c) {
  return computables.has(c);
}

// A map of all functions which have been made into computables.
var computifieds = new WeakMap();

// Constructor for computable.
function C(f) {
  if (isComputable(c)) return c;
  var c = computifieds.get(c);
  if (!c) {
    c = createComputable(f);
    computables.add(c);
    computifieds.set(f, c);
  }
  return c;
}

// Computable prototype. Heavily adorned elsewhere with methods.
var computablePrototype = {
  set(v)  { this.value = v; },
  get(v)  { return this.value; },
  valueOf { return this.value; },
  addDependency(objprop) { this.dependencies.add(objprop); }
  
};

function createComputable(f) {
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
