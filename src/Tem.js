// String templates
// ----------------

import C from './Fun';
import {interleave} from './Utl';

// Utility routine to compose a string by interspersing literals and values.
function compose(strings, ...values) {
  return strings && values && interleave(strings, values).join('');
}

// Template helper which handles HTML; return a document fragment.
// Example:
// ```
// document.body.appendChild(HTML`<span>${foo}</span><span>${bar}</span>`);
// ```
/* NEEDS WORK */
function HTML(strings, ...values) {
  var dummy = document.createElement('div');
  var fragment = document.createDocumentFragment();
  dummy.innerHTML = compose(strings, ...values);
  forEach.call(dummy.childNodes, appendChild, fragment);
  return fragment;
}

// Will often be imported/re-exported as `upwardableTemplate`, or `F`.
// Usage:
// ```
// T(F`There are ${model.count} items.`))
// ```
export default C(compose, "");
