// Upwardable Arrays
// =================

// Upwardable arrays are a particular flavor of upowardable objects,
// used when the underlying object is an array.
// They work like regular upwardable objects,
// with the expection of special casing for `length`.
// Upwardable arrays are actual arrays.
// That allows use of `forEach` and other methods on the `Array` prototype.

// An upwardable array is created by calling `makeUpwardableArray`,
// the default export from this module, on an array.
// `a = U([1, 2, 3])` creates an upwardable arrays.
// All accesses to the elements of `a` and `o` continue to function as usual:
// `a[0]`, `a[0] = 1;`.
// Newly added elements are also immediately observable.

// This module uses the basic machinery for upwardable objects,
// in `Upo#buildUpwardableObject`, specifying that `shadow` and `u` be arrays,
// and adding special handling for `length`.


// Convenience.
import {buildUpwardableObject} from './Upo';

var {observe} = Object;

const MODULE_NAME = 'Upa';



/**
 * ## make
 *
 * Constructor for upwardable array.
 */
function make(o) {
  console.assert(Array.isArray(o), `Input to ${MODULE_NAME}#make must be array.`);

  // Observer to handle change to length on the upwardified array (`u`).
  // Adjust length on shadow and original object.
  function objectObserver(changes) {
    changes.forEach(({name}) => {
      if (name === 'length') shadow.length = o.length = u.length;
    });
  }

  // Observer to handle change to length on the original array (`o`).
  // Adjust length on shadow and upwardable object.
  function targetObserver(changes) {
    changes.forEach(({name}) => {
      if (name === 'length') u.length = shadow.length = o.length;
    });
  }

  var shadow = [];
  var u = [];

  buildUpwardableObject(o, u, shadow);
  observe(o, targetObserver, ['update']);
  observe(u, objectObserver, ['update']);

  return u;
}

// Exports.
export default make;
