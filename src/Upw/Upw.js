// Upwardable
// ==========

// The **upwardable** is the key concept in the upward library.
// Upwardables are returned by upwardable functions,
// and represent values in upwawrdable objects.

// Setup.
var {getNotifier, defineProperty} = Object;
import {upwardConfig} from '../Cfg';

// Manage upwardables.
var set = new WeakSet();
var set = new Set(); // debug

function is (u) { return u && typeof u === 'object' && set.has(u); }
function add(u) { set.add(u); addId(u); }

var id = 0;

function addId(u) {
  if (upwardConfig.DEBUG) {
    defineProperty(u, '_upwardableId', { value: id++ });
  }
}

// Make a new upwardable.
// Register it, and add a `change` method which notifies when it is to be replaced.
function make(x) {
  var u = Object(x);
  if (!is(u)) {
    add(u);
    defineProperty(u, 'change', { value: change });
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

var isUpwardable = is;

export default make;
export {isUpwardable};
