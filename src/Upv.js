// Upwardable Values
// =================

// The **upwardable value** is one of the key concepts in the upward library.
// Upwardable values represent other values, but are watchable.
// They have a `change` method to change their values.
//
// The default export from this module is often imported as `makeUpwardableValue`,
// and is exposed as `V` in `index.js`.
//
// Since the primitive value in an object cannot be changed,
// When an upwardable value is changed we create a new one,
// and emit the `upward` notification against the original object.
//
// Properties on upwardable objects are represented by upwardable values in an shadow object.
 // Upwardable functions return Upwardable values.

const UPWARDABLE_VALUE = '_upwardableValue';
const is = u => u && typeof u === 'object' && u[UPWARDABLE_VALUE];


function make(v, options = {}) {

  // Private interface to set a new value.
  // If it itself ia an upwardable value, Observe the new value and set the ultimate value
  function setValue(newv) {
    value = v = newv;
    if (is(newv)) newv.observe(change), value = newv.value;
  }

  // Public interface to set the value of this upwardable value.
  // Unobserve old value if it itself was an upwardable value.
  // Report changes.
  function change(newv) {
    if (newv === v) return;
    if (is(v)) v.unobserve(change);
    for (let observer of observers) observer(newv);
    setValue(newv);
  }

  function observe  (observer) { observers.add   (observer); }
  function unobserve(observer) { observers.delete(observer); }
  function valueOf()           { return value; }

  var value;
  var observers = new Set();

  setValue(v);

  return {valueOf, change, observe, unobserve, value, [UPWARDABLE_VALUE]: true };
}

function getUpwardableValue(v) {
  return is(v) ? v.value : v;
}

export default make;
export {is as isUpwardableValue, getUpwardableValue};
