// UpElement/E
// ===========
// Create HTML elements.

import './Evt';
import './Chi';
import './Inp';
import './Att';

/**
 * ## UpElement

 * Create an element.
 * Support low-level sugar in form of `div#id.class`.
 */
function UpElement(tag) {
  var parts = tag.split(/([#.])/);
  tag = parts.shift();
  var elt = document.createElement(tag);

  while (parts.length) {
    let symbol = parts.shift();
    let val    = parts.shift();
    switch (symbol) {
    case '#': elt.id = val;           break;
    case '.': elt.classList.add(val); break;
    }
  }
  
  return elt;
}

// Re-exported as `E` by `Up.js`.
export default UpElement;
