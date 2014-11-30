import C from './Com';
import {interleave} from './Utl';

// String templates
// ----------------

// Utility routine to compose a string by interspersing literals and values.
function compose(strings, ...values) {
  return strings && values && interleave(strings, values).join('');
}

// Template helper which handles HTML; return a document fragment.
// Example:
// ```
// document.body.appendChild(HTML`<span>${foo}</span><span>${bar}</span>`);
// ```
// NEEDS WORK
function HTML(strings, ...values) {
  var dummy = document.createElement('div');
  var fragment = document.createDocumentFragment();
  dummy.innerHTML = compose(strings, ...values);
  forEach.call(dummy.childNodes, appendChild, fragment);
  return fragment;
}

export default C(compose);
