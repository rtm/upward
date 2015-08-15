// Upwardable
// ==========

// The **upwardable** is the key concept in the upward library.
// Upwardables are returned by upwardable functions,
// represent values in upwawrdable objects,
// and have a `change` method to change their values.

import {upwardConfig} from './Cfg';
import log from './Log';

const DEBUG_ALL = true;
const DEBUG = upwardConfig.DEBUG;

var {create, getNotifier, defineProperty, defineProperties} = Object;

var channel = log('Upw', { style: { color: 'red' } });


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

// Change an upwardable. Issue notification that it has changed.
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


export {make as default, is as isUpwardable};
