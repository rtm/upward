// DOM-related upward features
// ===========================

// Bookkeeping and initialization.
import C              from './Com';
import {constructComputable} from './Com';
import U              from './Upw';
import {dasherize}    from './Str';
import {mapObject}    from './Obj';
import {argify}       from './Fun';
import keepRendered   from './Ren';

var {createTextNode, createElement} = document;
var {appendChild}                   = HTMLElement.prototype;

// DOM element creation
// --------------------

// ### INPUT
var lastInputValue = constructComputable(function *_lastInputValue(rerun) {
  input.addEventListener('change', rerun);
  var [input] = yield "";
  while (true) [input] = yield input.value;
});

var currentInputValue = constructComputable(function *_currentInputValue(rerun) {
  input.addEventListener('input', rerun);
  var [input] = yield "";
  while (true) [input] = yield input.value;
});

function INPUT() {
  var input = document.createElement('input');
  return input;
}

// ### Buttons
var BUTTON = function(label, handler) {
	var button = createElt('button', {}, [TEXT(label)]);
  if (handler) { button.events({click: handler}); }
  return button;
};


// ### SPAN
var SPAN = argify(keepRendered, 'span');
var DIV  = argify(keepRendered, 'div');
var DETAILS = argify(keepRendered, 'details');
var SUMMARY = argify(keepRendered, 'summary');

// ### TextNode
var TEXT = constructComputable(function *_TEXT() {
  var node = document.createTextNode("");
  while (true) {
    let [text] = yield node;
    node.nodeValue = text;
  }
});

// Allow the String prototype methods to be applied to Text nodes.

// These are methods that overwrite the node value.
['concat', 'replace', 'slice', 'substr', 'substring', 'toUpperCase', 'toLowerCase', 'toLocaleUpperCase', 'toLocaleLowerCase', 'trim', 'trimLeft', 'trimRight', 'revese']
  .forEach(method => Text.prototype[method] = function() {
    return (this.nodeValue = String.prototype[method].apply(this.nodeValue, arguments));
  })
;

// These are methods that do not overwrite the node value.
['charAt', 'charCodeAt', 'indexOf', 'lastIndexOf', 'match', 'search', 'split']
  .forEach(method => Text.prototype[method] = function() {
    return String.prototype[method].apply(this.nodeValue, arguments);
  })
;

// Template helper which handles HTML; return a document fragment.
// Example:
// ```
// document.body.appendChild(HTML`<span>${foo}</span><span>${bar}</span>`);
// ```
function HTML(strings, ...values) {
  var dummy = document.createElement('div');
  var fragment = document.createDocumentFragment();
  dummy.innerHTML = compose(strings, ...values);
  forEach.call(dummy.childNodes, appendChild, fragment);
  return fragment;
}

export {INPUT, BUTTON, DIV, TEXT, SPAN, HTML, DETAILS, SUMMARY};
