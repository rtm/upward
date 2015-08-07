// Create text node (T)
// ====================

// Bookkeeping and initialization.
import {makeUpwardableFunction} from './Fun';

export default makeUpwardableFunction(function *upText() {
  var node = document.createTextNode("");
  while (true) {
    let [text] = yield node;
    node.nodeValue = text;
  }
});

// Extend String prototype
// -------------------------
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
