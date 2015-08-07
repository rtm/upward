// Tag shorthands
// ==============

import E from './Elt';
import T from './Txt';

function text(tag) {
  return function(t) {
    return E(tag) . has ([T(t)]);
  };
}

var P = text('p');

var H1 = text('h1');
var H2 = text('h2');
var H3 = text('h3');
var H4 = text('h4');
var H5 = text('h5');
var H6 = text('h6');

var B = text('b');
var I = text('i');

var LI = text('li');

var LABEL = text('label');

function A(t, href) {
  return E('a') . has(T(t)) . is ({ href });
}

function BUTTON(t, click) {
  return E('button') . has(T(t)) . does({ click });
}

export {P, H1, H2, H3, H4, H5, H6, B, I, LI, LABEL, A, BUTTON};
