// HTML input element transputting.
// ================================

// Bookkeeping and initialization.
import {isUpwardable} from './Upw';
var {defineProperty, observe} = Object;

// UpInputs associates an upwardable with the value of an input element.
// It is also available via the `inputs` method on HTMLInputElement.
// The 'realtime' parameter (default: false) controls whether each key in a text input is reported,
// or if the change is not reported until the control loses focus.

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

  observeUpwardable();
  return elt;
}

var prototype = HTMLInputElement.prototype;
var INPUTSPROP = 'sets';

if (!prototype[INPUTSPROP]) {
  defineProperty(prototype, INPUTSPROP, {
    value(upwardable, realtime) { return UpInputs(this, upwardable, realtime); }
  });
}

// Normally this module will be imported as `import './src/Inp';`.
export default UpInputs;
