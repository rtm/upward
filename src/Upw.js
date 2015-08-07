// Upwardable
// ==========

// The **upwardable** is the key concept in the upward library.
// Upwardables are returned by upwardable functions,
// represent values in upwawrdable objects,
// and have a `change` method to change their values.
var {create, getNotifier, defineProperty} = Object;
import {upwardConfig} from './Cfg';

// Manage upwardables.
var set = new WeakSet();

function is (u) { return u && typeof u === 'object' && set.has(u); }
function add(u) { set.add(u); addId(u); return u; }

// Add ids to upwardables.
var id = 0;
function addId(u) {
  if (upwardConfig.DEBUG) {
    defineProperty(u, '_upwardableId', { value: id++ });
  }
}

// Special machinery for upwardable `undefined` and `null`.
var nullUpwardablePrototype      = { valueOf() { return null; }, change };
var undefinedUpwardablePrototype = { valueOf() { },              change };

function makeNull()      { var u = create(nullUpwardablePrototype);      add(u); return u; }
function makeUndefined() { var u = create(undefinedUpwardablePrototype); add(u); return u; }

// Make a new upwardable.
// Register it, and add a `change` method which notifies when it is to be replaced.
function make(x) {
  var u;
  if (x === undefined) u = makeUndefined();
  else if (x === null) u = makeNull();
  else {
    u = Object(x);
    if (!is(u)) {
      add(u);
      defineProperty(u, 'change', { value: change });
    }
  }
  return u;
}

// Change an upwardable. Issue notification that it has changed.
function change(x) {
  var u = this;
  if (x !== this.valueOf()) {
    u = make(x);
    getNotifier(this).notify({object: this, newValue: u, type: 'upward'});
  }
  return u;
}

/* JSHint does not like `export as` syntax */
/* jshint ignore:start */
export {make as default, is as isUpwardable};
/* jshint ignore:end */
