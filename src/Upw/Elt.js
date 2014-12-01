// Create HTML Element with upwardable features.
// =============================================

// Bookkeeping and initialization.
import {makeUpwardableFunction} from './Fun';
import {dasherize}    from '../Utl/Str';
import {mapObject}    from '../Utl/Obj';
import {argify}       from '../Utl/Fun';
import                     './Evt';

var {appendChild} = HTMLElement.prototype;

function UpElement(tag, children, attrs, handlers) {
  var elt = document.createElement(tag);
  (children || []).forEach(appendChild, elt);
  if (handlers) { elt.events(handlers); }
  return elt;
}

// ### INPUT
var lastInputValue = makeUpwardableFunction(function *_lastInputValue(rerun) {
  input.addEventListener('change', rerun);
  var [input] = yield "";
  while (true) [input] = yield input.value;
});

var currentInputValue = makeUpwardableFunction(function *_currentInputValue(rerun) {
  input.addEventListener('input', rerun);
  var [input] = yield "";
  while (true) [input] = yield input.value;
});

// Template helper which handles HTML; return a document fragment.
// Example:
// ```
// document.body.appendChild(HTML`<span>${foo}</span><span>${bar}</span>`);
// ```
// TODO: MOVE THIS OR GET RID OF IT
function HTML(strings, ...values) {
  var dummy = document.createElement('div');
  var fragment = document.createDocumentFragment();
  dummy.innerHTML = compose(strings, ...values);
  forEach.call(dummy.childNodes, appendChild, fragment);
  return fragment;
}

export default UpElement;
