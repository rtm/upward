// HTML input elements
// ===================

// Bookkeeping and initialization.
import {isUpwardable} from './Upw';
var {defineProperty, observe} = Object;

/**
 * ## UpInputs (.sets)
 *
 * Associates an upwardable with the value of an input element.
 *
 * @param {HTMLInputElement} elt element to associate
 * @param {Upwardable} upwardable upwardable to associate
 * @param {boolean} realtime if true, update upwardable each char
 */

function UpInputs(elt, upwardable, realtime) {
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

// Extend HTMLInputElement prototype with `sets` method.
var prototype = HTMLInputElement.prototype;
var INPUTSPROP = 'sets';

if (!prototype[INPUTSPROP]) {
  defineProperty(prototype, INPUTSPROP, {
    value(upwardable, realtime) { return UpInputs(this, upwardable, realtime); }
  });
}

// Normally this module will be imported as `import './src/Inp';`.
export default UpInputs;
