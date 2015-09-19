// Upwardable Objects
// ===================

// Upwardable objects are one of the three key components of the upward library,
// along with upwardable values and upwardable functions.
// An **upwardable object** is an enhanced object which can detect and and act on
// accesses to its properties.

// An upwardable object is created by calling `makeUpwardableObject`,
// the default export from this module, on an object.
// In `index.js`, this is aliased to `U`.
// `a = U([1, 2, 3])` or `o = U({x: 1, y: 2}` create upwardables.
// All accesses to the elements of `a` and `o` continue to function as usual:
// `a[0]`, `a[0] = 1;`, `o.x`, and `o.x = 1`.
// Newly added properties are also immediately observable.

// Convenience.
import {accessNotifier}        from './Acc';
import {Observer}              from './Obs';
import makeUpwardableArray     from './Upa';
import makeUpwardableValue, {isUpwardableValue} from './Upv';

var {create, keys, getNotifier, observe, unobserve, defineProperty} = Object;

// Lists of all upwardable objects, and objects which have been upwardified.
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
 * Get the upwardable version of an object if it exists.
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
  if (is(o)) return o;           // Ignore upwardified objects as input.
  if (isUpwardableValue(o)) return o; // Ignore upwardified values as input.

  var u = get(o);                // Get previously upwardified version of this object, if any.

  if (!u) {
    if (Array.isArray(o)) u = makeUpwardableArray(o);
    else u = buildUpwardableObject(o, create({}), {}); // Create upwardified object.

    set.add(u);                  // Remember this upwardified object.
    upwardifieds.set(o, u);      // Remember original object and upwardified version.
  }

  return u;
}

/**
 * ## buildUpwardableObject
 *
 * Low-level constructor for upwardable object or array.
 * `o` is the object or array being upwardified.
 * `u` is the empty upwardified object or array.
 * `shadow` is an empty object or array of shadowed property or element values.
 */
export function buildUpwardableObject(o, u, shadow) {

  // Delete a property. Unobserve it, delete shadow entries.
  // By the time we get there, the property will already have been deleted on the original object,
  // either because it was deleted directly, or deleted due to a delete notification on the
  // upwardified object.
  function _delete(name) {
    console.assert(observers[name], "Observer not defined for " + name);

    observers[name].unobserve();

    delete observers[name];
    delete u        [name];
    delete shadow   [name];
  }

  // Update a property by reobserving.
  function update(name) {
    let observer = observers[name];
//    console.assert(observer, "Observer not defined for " + name);
    if (observer) observer.reobserve(shadow[name]);
  }

  // Add a property to the upwardified object.
  // Used to add properties initially, and also when added later to the original object.
  // Set up getter and setter, Observe. Populate shadow.
  function add(name) {
    console.log("Adding property", name);

    // Handle an assignment to the property on the upwardified object.
    // If the value actually changed, update it in the original object,
    // and reset shadow value to new version.
    // TODO: handle case where v is an upwardable of one sort or another.
    function set(v) {
      console.log("Setting property", name, v);
      var shadowValue = shadow[name];
      var oldValue    = shadowValue.valueOf();
      var setValue    = v.valueOf();

      if (oldValue === setValue) return;

      // Set the new value on the original object.
      o[name] = setValue;

      notifier.notify({type: 'update', object: u, name, oldValue});
      shadow[name] = shadowValue.change(v);
    }

    // When property on upwardable object is accessed, just shadow value.
    // Also notify access.
    function get() {
      accessNotifier.notify({type: 'access', object: u, name});
      return shadow[name];
    }

    function observe(changes) {
//      changes.forEach(change => shadow[name] = shadow[name].change(change.newValue));
//      observers[name].reobserve(shadow[name]);
    }

    shadow[name]    = makeUpwardableValue(o[name]);
    observers[name] = Observer(shadow[name], observe, ['upward']).observe();

    defineProperty(u, name, {set, get, enumerable: true});
  }

  // Observer to handle new or deleted properties on the upwardified object (`u`).
  // Take corresponding action on underlying object, which will cause the right things to happen.
  function objectObserver(changes) {
    changes.forEach(({type, name}) => {
      switch (type) {
      case 'add':    o[name] = u[name]; break;
      case 'delete': delete o[name];    break;
      }
    });
  }

  // Observer to handle new, deleted or updated properties on the target (original object).
  function targetObserver(changes) {
    changes.forEach(({type, name}) => actions[type](name));
    //notifier.notify(change); // TODO: figure out what this line was suppsoed to do
  }

  // List of observers for each shadow property.
  // We need to keep these around in order to delete them when the property is deleted.
  var observers = {};

  var actions = {add, update, delete: _delete};

  var notifier = getNotifier(u);

  // Add each property in original object.
  keys(o).forEach(add);

  observe(o, targetObserver);   // Observe changes by to original object.
  observe(u, objectObserver);   // Observe changes by user to upwardified object.
  //observe(shadow, function(changes) { console.log("shadow changes:", changes); });
  return u;
}

// Exports.
export {
  make as default,
  is as isUpwardableObject
};
