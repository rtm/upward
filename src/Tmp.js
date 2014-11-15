import C from './Com';

var {appendChild} = Node.prototype;
var {forEach} = Array.prototype;

// String templates
// ----------------

// Utility routine to compose a string by interspersing literals and values.
var compose = (strings, ...values) => {
  values.push('');
  return [].concat(...strings.map((e, i) => [e, valueize(values[i])])).join('');
};

// Template helper which detects upwardified parameters and adds notifiers.
var upwardifyTemplate = (strings, ...values) => computedUpwardable(() => compose(strings, ...values),  values);

// Template helper which detects upwardified parameters and adds notifiers.
/*jshint -W061 */
var upwardifyTemplateFormula = (strings, ...values) => computedUpwardable(() => eval(compose(strings, ...values)), values);

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

export {
  upwardifyTemplate,
  upwardifyTemplateFormula,
  HTML
};

