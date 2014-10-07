// DOM-related upward features
// ===========================

// Bookkeeping and initialization.
import {Upwardable, upwardify, chainify} from './upward';


var {createTextNode, createElement} = document;
var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

// DOM class prototype extensions
// ------------------------------
// ### New methods on HTMLElement
// We add convenience methods to the `HTMLElement` prototype.
Object.assign(HTMLElement.prototype, {
  // `child` calls `appendChild` the first time, then `replaceChild`.
  child: upwardify(chainify(appendChild), replaceChild),
  // `attr` sets the attribute on the element.
  attr: upwardify(chainify(setAttribute), setAttribute)
  // `attrs` takes a hash and sets the relevant attributes.
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
var BUTTON = function() {
  return document.createElement('button');
};


// ### DIV
var DIV = function() {
  return document.createElement('div');
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

export {INPUT, BUTTON, DIV, TEXT};
