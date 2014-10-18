// DOM-related upward features
// ===========================

// Bookkeeping and initialization.
import {Upwardable, upwardify, upwardifyWithObjectParam} from './upward';

import {chainify, swapify, argify} from './Fun';
import {dasherify}                 from './Str';
import {mapObject}                 from './Obj';
import {observeObject, makeObserver} from './Obs';

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
	var button = createElt('button', {}, [TEXT(label)]);
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
  return document.createTextNode(text); // for now
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

function setChildren(e, children) {
	
	var handlers = {
		splice({addedCount, index, object, removed}) { 
			var child = e.childNodes[index];
			while (removed.length--) {
				nextChild = child.nextSibling;
        e.removeChild(child);
        child = nextChild;
			}
			while (addedCount--) {
				child = e.insertBefore(object[index++], child);
			}
		},
    update({name, object}) { 
			e.replaceChild(object[name], e.childNodes[name]);
		},
    delete({name, object}) {
			e.replaceChild(document.createTextNode(""), e.childNodes[name]);
		},
    add({name, object}) { 
			e.appendChild(object[name]);
		}
	};
  children.forEach(appendChild, e);
	Array.observe(children, makeObserver(handlers));
}

// Build a DOM node from tagname, attributes and children.
function createElt(...args) {
	var tagName = 'div', attrs = {}, children = [];

	if (typeof args[0] === 'string') { tagName = args.shift(); }
	if (args[0] && args[0].constructor === Object) { attrs = args.shift(); }
  children = args[0];

  var e = document.createElement(tagName);
	setChildren(e, children);
	return e;

	var handlerMakers = {
		style:     styleObservationHandlers,
		dataset:   datasetObservationHandlers,
		class:     classObservationHandlers,
		attribute: attributeObservationHandlers
	};
	var clearers = {
		style     (e) { e.style = ""; },
		dataset   (e) { keys(e.dataset).forEach(k => delete e.dataset[k]); },
    class     (e) { e.className = ""; },
    attribute (e) { for ([name] of e.attributes) { e.removeAttribute(name); } }
	};

	var handlers = {};

	var attrHandler = makeObserver({});
	
	function setAttrsObserver() {
		observer(attrs, function(changes) {
			changes.forEach(function({name, type, oldValue, object}) {
				switch (type) {
				case "delete":
					clearers[type]();
				case "style":
				case "dataset":
				case "class":
					switch (type) {
					case "add":
					case "update":
						resetHandler(name, object[name], oldValue);
					case "delete":
					  unsetHandler(name, oldValue);
					}
					break;
				default:
					case "delete":
            cle
				}
			});
		});
	}
		
	function unsetHandler(type, v) {
		if (v)  { unobserve(v,  handlers[type]); }
	}
  function setHandler(type, nv, v) {
		if (nv) { observe  (nv, handlers[type] = handlerMakers[type](e));	}
	}
	function resetHandler(type, nv, v) {
    unsetHandler(type, v );
    setHandler  (type, nv);
	}

  keys(handlerMakers).forEach(type => setHandler(type, attrs[type]));

	upward(attrs /*(DO SOMEITHNG*/);


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

// To update classes, use the classList interface.
function classListObserverHandlers(elt) {
  var add    = function(name, o) { elt.classList.toggle(o[name]); };
  var _delete = function(name) { elt.classList.remove(name); };
  return {add, change: add, delete: _delete};
}

// To update styles, do not delete deleted properties, but rather set to the null string.
function styleObserverHandlers(elt) {
  var add     = function(name, o) { elt.style[name] = o[name]; };
  var _delete = function(name)    { elt.style[name] = ""; };
  return {add, change: add, delete: _delete};
}

function datasetObserverHandlers(elt) {
  var add     = function(name, o) { elt.dataset[name] = o[name]; };
  var _delete = function(name) { delete elt.dataset[name]; };
  return {add, change: add, delete: _delete};
}

// To update attributes, the {set/remove}Attribute API.
function attributeObserverHandlers(elt) {
	var add     = function(name, o) { elt.setAttribute(name, o[name]); }
  var _delete = function(name)    { elt.deleteAttribute(name);       }
  return {add, change: add, delete: _delete};
}


export {INPUT, BUTTON, DIV, TEXT, SPAN, HTML, createElt};
