// Upwardable Values
// =================

// The **upwardable value** is one of the key concepts in the upward library.
// Upwardable values represent primitive values.
// They have a `change` method to change their values.
//
// The default export from this module is often imported as `makeUpwardable`,
// and is exposed as `V` in `index.js`.
//
// Since the primitive value in an object cannot be changed,
// When an upwardable value is changed we create a new one,
// and emit the `upward` notification against the original object.
//
// Properties on upwardable objects are represented by upwardable values in an shadow object.
// Upwardable functions return Upwardable values.

import {upwardConfig} from './Cfg';
import log from './Log';
import {isUpwardableObject} from './Upo';

const DEBUG_ALL = true;
const DEBUG = upwardConfig.DEBUG;

var {create, getNotifier, defineProperty, defineProperties} = Object;

var channel = log('Upw', { style: { color: 'red' } });
channel.disable();


// Manage upwardables.
var set = new WeakSet();

function is (u) { return u && typeof u === 'object' && set.has(u); }
function add(u, debug) { set.add(u); adorn(u, debug); return u; }

// Add ids and debug flag to upwardables.
var id = 0;

function adorn(u, debug = false) {
  if (upwardConfig.DEBUG) {
    defineProperties(u, {
      _upwardableId: { value: id++ },
      _upwardableDebug: { value: debug }
    });
  }
}

// Special machinery for upwardable `undefined` and `null`.
var nullUpwardablePrototype      = { valueOf() { return null; }, change };
var undefinedUpwardablePrototype = { valueOf() { },              change };

function makeNull()      { var u = create(nullUpwardablePrototype);      add(u); return u; }
function makeUndefined() { var u = create(undefinedUpwardablePrototype); add(u); return u; }

// Make a new upwardable.
// Register it, and add a `change` method which notifies when it is to be replaced.
function make(x, options = {}) {
  var {debug = DEBUG_ALL} = options;
  var u;

  debug = DEBUG && debug;

  if (x === undefined) u = makeUndefined();
  else if (x === null) u = makeNull();
//  else if (isUpwardableObject(x)) u = x;  // TODO: figure this out
  else {
    u = Object(x);
    if (!is(u)) {
      add(u, debug);
      defineProperty(u, 'change', { value: change });
    }
  }
  if (debug) console.debug(...channel.debug("Created upwardable", u._upwardableId, "from", x));
  return u;
}

// Change an upwardable.
// Issue notification of type `upward` that it has changed.
function change(x) {
  var u = this;
  var debug = u._upwardableDebug;

  if (x !== this.valueOf()) {
    u = make(x, { debug });
    getNotifier(this).notify({object: this, newValue: u, type: 'upward'});

    if (debug) {
      console.debug(...channel.debug("Replaced upwardable", this._upwardableId, "with", u._upwardableId));
    }
  }
  return u;
}


export {make as default, is as isUpwardableValue};
