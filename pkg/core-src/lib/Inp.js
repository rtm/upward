// HTML input elements
// ===================

// Bookkeeping and initialization.
import {isUpwardable} from './Upw';
var {defineProperties, observe} = Object;

/**
 * ## UpInputs (.sets)
 *
 * Associates an upwardable with the value of an input element.
 *
 * @param {HTMLInputElement} elt element to associate
 * @param {Upwardable} upwardable upwardable to associate
 * @param [boolean=false] realtime if true, update upwardable each char
 */

function UpInputs(elt, upwardable, realtime = false) {
  console.assert(elt instanceof HTMLInputElement, "First argument to UpInputs must be input element");
  console.assert(isUpwardable(upwardable), "Second argument to UpInputs (.inputs) must be upwardable");

  function observeUpwardable() {
    observe(upwardable, changes => changes.forEach(
      change => elt.value = change.newValue), ['upward']);
  }

  elt.addEventListener(realtime ? 'input' : 'change', _ => {
    upwardable = upwardable.change(elt.value);
    observeUpwardable();
  });

  elt.value = upwardable;
  observeUpwardable();
  return elt;
}

// Extend HTMLInputElement prototype with `sets` and `setsImmediate` methods.
var {prototype} = HTMLInputElement;
var SETS_PROP = 'sets';
var SETS_IMMEDIATE_PROP = 'setsImmediate';

if (!prototype.hasOwnProperty(SETS_PROP)) {
  defineProperties(prototype, {
    [SETS_PROP]:           { value(upwardable) { return UpInputs(this, upwardable, false); } },
    [SETS_IMMEDIATE_PROP]: { value(upwardable) { return UpInputs(this, upwardable, true ); } }
  });
}


// Normally this module will be imported as `import './src/Inp';`.
export default UpInputs;
