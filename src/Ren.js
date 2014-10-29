// keepRendered: create dynamically updated DOM node.
// =================================================

// Bookkeeping and initialization.
import {Upwardable, upwardify, upwardifyWithObjectParam} from './Upw';

import {chainify, swapify, argify}   from './Fun';
import {dasherize}                   from './Str';
import {mapObject}                   from './Obj';
import {observeObject, makeObserver} from './Obs';

var {createTextNode, createElement} = document;
var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

function _keepRendered(params) {
  var result = document.createElement(params.tagName);

  // Handle changes to parameters.
  // -----------------------------
  function makeParamsObserver() {
    
    // Observe and unobserve the children.
    function _observe  (v) { observeObject  (v, childrenObserver); }
    function _unobserve(v) { unobserveObject(v, childrenObserver); }
    
    // When we get a new set of children, set up observer on it.
    function add(v, i) {
      if (i === 'children') {  _observe(v); }
    }
    
    // When the child array changes, tear down and resetup observer on it.
    function update(v, i, params, {oldValue}) {
      switch(i) {
      case 'children':  _unobserve(oldValue); _observe(v); break;
      }
    }
    
    return makeObserver({add, update, end});
  }

  // Handle changes to children.
  // ---------------------------
  function makeChildrenObserver() {

    function add(v)     { result.appendChild(v); }
    function _delete(v) { result.removeChild(v); }
    function update(v, i, c, {oldValue}) { result.replaceChild(v, oldValue); }
    function end()      { }

    return makeObserver({add, update, delete: _delete, end});
  }

  function makeAttributeObserver() {
    function add(v, k)     { result.setAttribute(k, v); }
    function _delete(v, k) { result.removeAttribute(k); }
    return makeObserver({add, update: add, delete: _delete});
  }

  var observersAndRemovers = {
    style: {
      observer: function() {
        function add(v, k)     { elt.style[k] = v; }
        function _delete(v, k) { result.style[name] = ""; };
        return makeObserver({add, update: add, delete: _delete});
      },
      remover: function() {
        result.style = "";
      }
    },
    dataset: {
      observer: function() {
        function add(v, k)     { elt.dataset[k] = v; }
        function _delete(v, k) { delete elt.dataset[k]; }
        return makeObserver({add, change: add, delete: _delete});
      },
      remover: function() [
        keys(result.dataset).forEach(k => delete result.dataset[k]); 
      }
    },
    class: {
      observer: function() {
        function add(v, k)     { result.classList.toggle(dasherize(k), v); }
        function _delete(v, k) { result.classList.remove(dasherize(k)); };
        return makeObserver({add, change: add, delete: _delete});
      },
      remover: function() {
        result.className = ""; 
      }
    },
    attributes: {
      observer: function() {},
      remover: function() {
        for ([name] of e.attributes) { e.removeAttribute(name); }
      }
    }
  };

  mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
  params = valueizeObject(params);
  params.attrs = params.attr || {};
  params.children = params.children || {};
  params.trigger = 0;
  observeObjectNow(params, paramsObserver);

  return result;
}

export default function(tagName, attrs = {}, children = []) {
  return _keepRendered({tagName, attrs, children});
}


// Toggle a class on an element
function toggleClass(cls, b) { 
	this.classList.toggle(dasherify(cls), b); 
}

// Set classes on an object based on boolean-valued hash of camelCase names
function setClass(cls_hash) {
	mapObject(cls_hash, swapify(toggleClass), this);
}

var handlerMakers = {
  style:     styleObservationHandlers,
  dataset:   datasetObservationHandlers,
  class:     classObservationHandlers,
  attribute: attributeObservationHandlers
};

var clearers = {
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

export default keepRendered;
