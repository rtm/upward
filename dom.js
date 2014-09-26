/* jshint esnext: true */

import {upwardify, chainify, defineUpwardableProperty} from 'upward';

var {createTextNode, createElement} = document;
var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

Object.assign(HTMLElement.prototype, {
  child: upwardify(chainify(appendChild), replaceChild),
  attr: upwardify(chainify(setAttribute), setAttribute)
});

Object.assign(Node.prototype, {
  value: upwardify(chainify(function(v) { this.nodeValue = v || ""; })),
  toValue: function() { return this; }
});

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
  this.deleteRule(idx);
  return this.insertRule(rule, idx);
};

var INPUT = function() {
  var input = document.createElement('input');
  var propname = evt_type => `val_${evt_type}`;
  var handler = { handleEvent: evt => input[propname(evt.type)] = input.value };
  ['input', 'change'].forEach(evt_type => {
    input.addEventListener(evt_type, handler);
    defineUpwardableProperty(input, propname(evt_type), "");
  });
  return input;
};

var BUTTON = function() {
  return document.createElement('button');
};


var DIV = function() {
  return document.createElement('div');
};

var TEXT = function(text) {
  return document.createTextNode("").value(text);
};

export {INPUT, BUTTON, DIV, TEXT};
