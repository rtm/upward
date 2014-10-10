// DOM-related upward features
// ===========================

// Bookkeeping and initialization.
import {Upwardable, upwardify, upwardifyWithObjectParam} from './upward';

import {chainify, swapify}     from './Fun';
import {dasherify}             from './Str';
import {mapObject}             from './Obj';

var {createTextNode, createElement} = document;
var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

// DOM class prototype extensions
// ------------------------------

// ### New methods on HTMLElement
// We add convenience methods to the `HTMLElement` prototype.

// Toggle a class on an element
function toggleClass(cls, b) { 
	this.classList.toggle(dasherify(cls), b); 
}

// Set classes on an object based on boolean-valued hash of camelCase names
function setClass(cls_hash) {
	mapObject(cls_hash, swapify(toggleClass), this);
}

Object.assign(HTMLElement.prototype, {
  // `child` calls `appendChild` the first time, then `replaceChild`.
  child: upwardify(chainify(appendChild), replaceChild),
  // `attr` sets the attribute on the element.
  attr: upwardify(chainify(setAttribute), setAttribute),
  // `attrs` takes a hash and sets the relevant attributes.
	// TBI

	// `class` sets and removes classes on the element, based on a bool-valued hash
	classes: upwardifyWithObjectParam(chainify(setClass), toggleClass)
});

// ### New methods on Node
// We add convenience methods to the `Node` prototype.
Object.assign(Node.prototype, {
  // `value` sets the value on the node.
  value: upwardify(chainify(function(v) { this.nodeValue = v || ""; })),
  // We need `toValue` to do the right thing.
  toValue: function() { return this; }
});

// DOM element creation
// --------------------

// ### INPUT
var INPUT = function() {
  var input = document.createElement('input');
  var propname = evt_type => `val_${evt_type}`;
  var handler = { handleEvent(evt) { input[propname(evt.type)] = input.value } };
  ['input', 'change'].forEach(evt_type => {
    input.addEventListener(evt_type, handler);
    Upwardable("").define(input, propname(evt_type));
  });
  return input;
};

// ### Buttons
var BUTTON = function(label, handler) {
	var button = document.createElement('button');
	if (label) { button.child(TEXT(label)); }
  if (handler) { button.events({click: handler}); }
  return button;
};


// ### DIV
var DIV = function() {
  return document.createElement('div');
};

// ### SPAN
var SPAN = function() {
  return document.createElement('span');
};

// ### TextNode
var TEXT = function(text) {
  return document.createTextNode("").value(text);
};

// Provide a `reverse` method for strings.
String.prototype.reverse = function() {
  return this.split().reverse().join('');
};

// Allow the String prototype methods to be applied to Text nodes.

// These are methods that overwrite the node value.
['concat', 'replace', 'slice', 'substr', 'substring', 'toUpperCase', 'toLowerCase', 'toLocaleUpperCase', 'toLocaleLowerCase', 'trim', 'trimLeft', 'trimRight', 'revese']
  .forEach(method => Text.prototype[method] = function() {
    return this.nodeValue = String.prototype[method].apply(this.nodeValue, arguments);
  })
;

// These are methods that do not overwrite the node value.
['charAt', 'charCodeAt', 'indexOf', 'lastIndexOf', 'match', 'search', 'split']
  .forEach(method => Text.prototype[method] = function() {
    return String.prototype[method].apply(this.nodeValue, arguments);
  })
;

// DOM Building
// ------------

// Build a class string from an object with camelized keys and boolean values.
// Example:
// ```
// createElt('div', {className: makeClassname({myClass: true})})
// <div class="my-class"/>
// ```
// Aliased to CLASS.
var makeClassName = upwardifyWithObjectParam(
  o => 
    keys(o)
    .filter(k => o[k])
    .map(dasherify)
    .join(' ')
);

// Build a DOM node from tagname, attributes and children.
function createElt(tagName, attrs = {}, children = []) {
  var e = createElement(tagName);
  (children || []).forEach(appendChild, e);
  assign(e.attributes, attrs);
  return e;
}

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

export {INPUT, BUTTON, DIV, TEXT, SPAN, HTML};
