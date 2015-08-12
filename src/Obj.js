// Upwardable Objects
// ===================

// Upwardable objects are one of the three key components of the upward library,
// along with upwardable values and upwardable functions.
// An **upwardable object** is an enhanced object which can detect and and act on
// accesses to its properties.

// An upwardable object is created by calling `makeUpwardableObject`,
// the default export from this module, on an object.
// In `index.js`, this is aliased to `U`.
// `a = Up([1, 2, 3])` or `o=Up({x: 1, y: 2}` create upwardables.
// All accesses to the elements of `a` and `o` continue to function as usual:
// `a[0]`, `a[0] = 1;`, `o.x`, and `o.x = 1`.
// Newly added properties are also immediately observable.

// Convenience.
import {accessNotifier}        from './Acc';
import {Observer}              from './Obs';
import makeUpwardable          from './Upw';
import {isUpwardable}          from './Upw';

var {create, keys, getNotifier, observe, unobserve, defineProperty} = Object;

// Lists of all upwardables, and objects which have been upwardified.
var set          = new WeakSet();
var upwardifieds = new WeakMap();

/**
* ## is
*
* Check if an object is upwardified.
* Exported as `isUpwardableObject`.
*/
function is(u) { return u && typeof u === 'object' && set.has(u); }

/**
 * ## get
 *
 * Get the upwardable version of an object.
 */
function get(o) { return o && typeof o === 'object' && upwardifieds.get(o); }

/**
 * ## make
 *
 * Constructor for upwardable object.
 * Default export from this module, often imported as `makeUpwardableObject`,
 * and aliased as `U` in `index.js`.
 */
function make(o) {
  if (is(o)) return o;
  var u = get(o);
  if (!u) {
    u = _make(o);
    set.add(u);
    upwardifieds.set(o, u);
  }
  return u;
}

/**
 * ## _make
 *
 * Low-level constructor for upwardable object.
 */
function _make(o) {

  var shadow = {};
  var observers = {};
  var actions = {add, update, delete: _delete};

  // Delete a property. Unobserve it, delete shadow and proxy entries.
  function _delete(name) {
    observers[name].unobserve();
    delete observers[name];
    delete u        [name];
    delete shadow   [name];
  }

  // Update a property by reobserving.
  function update(name) {
    observers[name].reobserve(shadow[name]);
  }

  // Add a property. Set up getter and setter, Observe. Populate shadow.
  function add(name) {

    function set(v) {
      var oldValue = shadow[name];
      if (oldValue === v) return;
      o[name] = v;
      notifier.notify({type: 'update', object: u, name, oldValue});
      shadow[name] = oldValue.change(v);
    }

    // When property on upwardable object is accessed, report it and return shadow value.
    function get() {
      accessNotifier.notify({type: 'access', object: u, name});
      return shadow[name];
    }

    function observe(changes) {
//      changes.forEach(change => shadow[name] = shadow[name].change(change.newValue));
//      observers[name].reobserve(shadow[name]);
    }

    shadow[name] = makeUpwardable(o[name]);
    observers[name] = Observer(shadow[name], observe, ['upward']).observe();
    defineProperty(u, name, {set: set, get: get, enumerable: true});
  }

  // Observer to handle new or deleted properties on the object.
  // Pass through to underlying object, which will cause the right things to happen.
  function objectObserver(changes) {
    changes.forEach(({type, name}) => {
      switch (type) {
      case 'add':    o[name] = u[name]; break;
      case 'delete': delete o[name];    break;
      }
    });
  }

  // Observer to handle new, deleted or updated properties on the target.
  function targetObserver(changes) {
    changes.forEach(({type, name}) => actions[type](name));
    //notifier.notify(change); // TODO: figure out what this line was suppsoed to do
  }

  var u = create({}); // null?
  var notifier = getNotifier(u);
  keys(o).forEach(add);
  observe(o, targetObserver);
  observe(u, objectObserver);
  return u;
}

// Exports.
export default make;
var isUpwardableObject = is;
export {
  isUpwardableObject
};
