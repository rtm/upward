// Upwardable Objects
// ===================

// Upwardable objects are one of the three key components of the upward library,
// along with upwardable values and upwardable functions.
// An **upwardable object** is an enhanced object which can detect and and act on
// accesses to its properties.

// An upwardable object is created by calling `makeUpwardableObject`,
// the default export from this module, on an object.
// In `index.js`, this is aliased to `U`.
// `a = U([1, 2, 3])` or `o = U({x: 1, y: 2}` create upwardable objects.
// All accesses to the elements of `a` and `o` continue to function as usual:
// `a[0]`, `a[0] = 1;`, `o.x`, and `o.x = 1`.
// Newly added properties are also immediately observable.

import {mapObject} from './Obj';
import makeUpwardableValue, {getUpwardableValue} from './Upv';

/**
 * ## make
 *
 * Create upwardable object.
 * Default export from this module, often imported as `makeUpwardableObject`
 * Aliased as `U` in `index.js`.
 * `o` is the object or array being upwardified.
 */
export default function make(o, options) {

  // Set up a new property.
  // Used both at create time, and when a new property is added.
  function setupProperty(value, property) {
    value = makeUpwardableValue(value);
    //    value.observe();
    return value;
  }

  function get(target, property, receiver) {
    // TODO: track that this has been accessed.
    return Reflect.get(...arguments);
  }

  function set(target, property, value, receiver) {
    o[property] = getUpwardableValue(value);

    if (!(property in target)) {
      value = setupProperty(value, property);
      value.observe();
      return Reflect.set(...arguments);
    }
    else {
      target[property].change(value);
      return true;
    }
  }

  // Delete a property. Unobserve it, delete target entries.
  function deleteProperty(target, property) {
    delete o[property];
    return Reflect.deleteProperty(...arguments);
  }

  var handler = {get, set, deleteProperty};

  // The target of the proxy is a parallel object of upwardable values.
  var target = mapObject(o, setupProperty);

  return new Proxy(target, handler);
}

var x = make({a: 1});
console.log(x);
