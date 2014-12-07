// Create HTML Element with upwardable features.
// =============================================

// Bookkeeping and initialization.
import './Evt';
import './Chi';
import './Inp';

var {appendChild} = HTMLElement.prototype;

// Create an element.
// Support low-level sugar in form of `div#id.class`.
function UpElement(tag) {
  var parts = tag.split(/([#.])/);
  tag = parts.shift();
  var elt = document.createElement(tag);

  for (var i = 0; i < parts.length; i += 2) {
    let symbol = parts[i], val = parts[i+1];
    if (symbol === '#') elt.id = val;
    else if (symbol === '.') elt.classList.add(val);
  }
  
  return elt;
}

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
