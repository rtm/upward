// Convenience.
var {create, keys, assign, defineProperty} = Object;
var {createElement, createTextNode, createDocumentFragment} = document;
var {appendChild} = Node;

// ### Configuration

// Control upward configuration with `LOGGING` and `DEBUG` flags.
var upwardConfig = {
  LOGGING: true,
  DEBUG: true
};

// Keep a counter which identifies upwardables for debugging purposes.
var id = 0;

// Set configuration options.
function configureUpwardable(opts) {
  assign (upwardConfig, opts);
}

// String utilities
// ----------------

function camelify(str) {
	return str.replace(/[-_][a-z]/g, (_, letter) => letter.toUpperCase());
}

function dasherify(str) {
  return str.replace(/([a-z])([A-Z])/, (_, let1, let2) => let1 + '-' + let2.toLowerCase());
}

String.prototype.camelify = function() { return camelify(this); };
String.prototype.dasherify = function() { return dasherify(this); };

// Functional utilities
// --------------------

// Create a delayed version of a function.
function laterify(fn, {delay = 10} = {}) {
  return function() {
		return setTimeout(() => fn.apply(this, arguments), delay);
	}
}

// Transform a function so that it always returns `this`.
function chainify(fn) {
  return function(...args) { fn.call(this, ...args); return this; };
}

// Make a function which returns itself.
// This supports the odd syntax fn(x)(y).
function selfify(fn) {
  return function selfified() {
     fn.apply(this, arguments);
     return selfified;
  };
}

// Make a function which memozies its result.
function memoify(fn, {hash = x => x, cache = {}} = {}) {
  function memoified(...args) {
    var key = hash(...args);
    return key in cache ? cache[key] : cache[key] = fn.call(this, ...args);
  }
  memoified.clear = () => cache = {};
  return memoified;
}

function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

function log(...args) {
  if (upwardConfig.LOGGING) {
    console.log('UPWARDIFY:\t', ...args);
  }
}

// Generic version of `valueOf` which works for anything.
function valueOf(v) {
    return v == null ? v : v.valueOf();
}

// Analog of `Array#map` for objects.
function mapObject(o, fn, ctxt) {
  return keys(o).reduce((result, k) => result[k] = fn.call(ctxt, o[k]), result);
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

// Unused?
function makeUpwardableProperty(o, p) {
  return Upwardable(o[p], {o, p}).defineAsProperty(o, p);
}

// ### Upwardable

// The heart and soul of the upward library.
// An object which remembers its value and upward destinations.
function Upwardable(v, options = {}, upwards = []) {
  console.assert("Cannot make upwardable out of upwardable", !isUpwardable(v));

  function toString() { return `upwardable on ${objectToString(options)}`; }

	var {once, later, disable} = options;

  // Provide an accessor (getter/setter) to apply to object properties
  // (with `#define`).
  // The getter returns the upwardable itself.
  // The setter notifies upward dependencies, and sets the internal value.
  // The property must be enumerable so we copy or `assign` it.
  var accessor = {
    get: function()   { 
      reporters[reporters.length-1](u);
      return u; 
    },
    set: function(nv) {
      if (!disable) {
				upwards.forEach(fn => fn(valueOf(nv), valueOf(v), u, options));
        v = nv;
        disable = once;
      }
    },
    enumerable: true
  };

  // The upwardable consists of four properties, `valueOf`, `upward`, `define`, and `val`.
  // `#valueOf` returns the value of the underlying value.
  // `#upward` adds an upward dependency.
  // Usually called via the `upward` routine which ensures upwardability.
  // `#define` applies to the accessor to a specified object property.
  var u = assign(create(upwardablePrototype), {
    valueOf()         { return valueOf(v); },
    upward(fn)        { upwards.push(fn); },
    define(o, p)      { return defineProperty(o, p, accessor); },
  });

  u.define(u, 'val');
  
  if (upwardConfig.DEBUG) {
    assign(u, {id, toString});
    id++;
  }

  return u;
}

var reporters = [() => undefined];

var upwardablePrototype = {
  toUpperCase: function() {
    return computedUpwardable(
      function() { return valueOf(this).toUpperCase(); },
      this
    );
  }
};

function upwardReport(fn, reporter) {
  var result;
  reporters.push(reporter);
  result = fn();
  reporters.pop();
  return result;
}

// Check if something is upwardable, by looking for its `upward` property.
function isUpwardable(u) {
  return u && typeof u === 'object' && u.upward;
}

// Make something upwardable if it isn't already.
function castUpwardable(u) {
  return isUpwardable(u) ? u : Upwardable(u);
}

// Safely set an upward relationship, or not..
function upward(o, fn) {
  return isUpwardable(o) && o.upward(fn);
}

// Create an upwardable whose value is given by a function.
// When any of the dependencies change, the value is recomputed,
// triggering the upward behavior.
function computedUpwardable(fn, ctxt) {
  fn = fn.bind(ctxt);
  reporters.push(udep => upward(udep, () => u.val = fn()));
  var u = Upwardable(fn());
  reporters.pop();
  return u;
}

// Transform a function to make it upward-aware.
// The first time, it calls the passed-in function, maintaining context.
// When things change, it calls an alternative function.
function upwardify(fn, changefn = fn) {
  return function(v) {
    upward(v, changefn.bind(this));
    return fn.call(this, valueOf(v));
  };
}

// `upwardifyWithObjectParam` creates a function which takes a hash as its parameter.
// On the first call, the underlying function is called with the cooked hash.
// When properties in the hash change, a `changefn` is called with the key and new value.
function upwardifyWithObjectParam(fn, changefn = fn) {
  return function(o) {
    upwardifyProperties(o);
    keys(o).forEach(k => upward(o[k], nv => changefn(k, nv)));
    return fn.call(this, valueOfObject(o));
  };
}

// A common case for functions taking a hash as argument is to want to merge (assign)
// the property/value pairs into an underlying hash, 
// which should then be updated when the hash changes.
// `upwardifyAssign` turns a hash into a function which modifies it.
// It is passed on a function yielding the hash to be assigned to.
function upwardifiedAssign(fn) {
  return upwardifyWithObjectParam(
    oo => assign(fn.call(this), oo),
    (p, v) => fn.call(this)[p] = v
  );
}
    
// `upwardifyProperty` modifies a single property on an object for upwardability.
// This is mainly used from 'upwardifyProperties` below.
function upwardifyProperty(o, p) {
  castUpwardable(o[p]).define(o, p);
  return o;
}

// `upwardifyProperties` modifies all properties in an object, in place, for upwardability.
// A non-enumerable `upwardified` property is added to the object.
// Note this is *not* the same as making the object itself upwardable.
function upwardifyProperties(o) {
  if (!o.upwardified) {
    keys(o).forEach(k => upwardifyProperty(o, k));
    defineProperty(o, 'upwardified', { value: true });
  }
  return o;
}


// DOM Building
// ------------

// Build a class string from an object with camelized keys and boolean values.
// Example:
// ```
// createElt('div', {className: makeClassname({myClass: true})})
// <div class="my-class"/>
// ```
// Aliased to CLASS.
var makeClassName = upwardifyWithObjectParam(
	o => 
		keys(o)
		.filter(k => o[k])
		.map(dasherify)
		.join(' ')
);

// Build a DOM node from tagname, attributes and children.
function createElt(tagName, attrs = {}, children = []) {
	var e = createElement(tagName);
	(children || []).forEach(appendChild, e);
	assign(e.attributes, attrs);
	return e;
}

// Event handling
// ==============

// Events are handled by calling `on` on an element, and passing a hash of handlers.
//
// Example:
// ```
// BUTTON().on({click: handleButtonClick});
//
// function handleButtonClick(evt) {
//     // this.context is the button
// }
// ```

// Define a prototypical `handleEvent` for event listeners,
// which dispatches events to a method of the same name.
var EventListenerPrototype = {
  handleEvent(evt) { return this[evt.type](evt); }
};

// `on` is a method on `EventTarget`s (meaning HTML elements), 
// which is passed event handlers in the form of a hash keyed by event name.
EventTarget.prototype.on = function(handlers) {
  var listener = create(EventListenerPrototype);
  assign(listener, handlers, {context: this});
  keys(handlers).forEach(evt_type => this.addEventListener(evt_type, listener));
  return this;
};

// String templates
// ----------------

//Utility routine to compose a string by interspersing literals and values.
var compose = (strings, ...values) => {
  values.push('');
  return [].concat(...strings.map((e, i) => [e, values[i].valueOf()]));
};

// Template helper which detects upwardified parameters and adds notifiers.
var upwardifyTemplate = (strings, ...values) => computedUpwardable(() =>      compose(strings, ...values),  values);

// Template helper which detects upwardified parameters and adds notifiers.
var upwardifyTemplateFormula = (strings, ...values) => computedUpwardable(() => eval(compose(strings, ...values)), values);

export {
  Upwardable,
  computedUpwardable,
  upwardifyProperties,
  valueOf,
  upwardifyTemplate,
  upwardifyTemplateFormula,
	createElt,

  isUpwardable,
  upward,
  upwardify,
  configureUpwardable,

  chainify
};
