// HTML input elements.
// ====================

// Bookkeeping and initialization.
import makeUpwardable from './Upw';

var {defineProperty} = Object;

// Input elements themselves are created using `UpElement`.
// Here we define upwardables to obtain current and most recent value
// as 'change' and 'input' properties on the input element.
// The initial access is to the property on the prototype,
// which immediately sets up an upwardable property on the element.

['change', 'input'].forEach(
  prop => defineProperty(HTMLInputElement.prototype, prop, {
    get() {
      var value = makeUpwardable(this.value);
      defineProperty(this, prop, {value, writable: true});
      this.addEventListener(prop, _ => this[prop] = this[prop].change(this.value));
      return value;
    },
    configurable: true
  })
);

// This module exports nothing. It merely affects the HTMLInputElement prototype.
// It must be imported somewhere with `import 'src/Inp.js';`.
