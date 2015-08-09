// Build CSS sheets and rules.
// ===========================

// Setup.
import {dasherize} from './Str';
import {upwardConfig} from './Cfg';

var {assign, defineProperty} = Object;

// Handle scoping.
// ---------------

var scopedSupported = 'scoped' in document.createElement('style');

var scopedStyleId = 0;
var scopedStyleIdsProp = "scopedStyleIds";
var makeScopedStyleId = id => 's' + id;

// "Scopify" a set of selectors to an element identifed by a data-scoped-style-ids attribute.
// Each selector is turned into two selectors.
// The first places the `[data-...]` selector in front, to address descendnats.
// The second attaches it to the first subselector, to address the element itself.
function scopifySelectors(selectors, scope_id) {
  var scoper = `[data-${dasherize(scopedStyleIdsProp)}~=${scope_id}]`;
  return [].concat(
    selectors.split(',')
      .map(selector => {
        var [head, ...tail] = selector.trim().split(/([\s+>~])/).filter(Boolean);
        return [
          `${scoper} ${selector}`,
          [`${head}${scoper}`, ...tail].join('')
        ];
      })
  ).join(',');
}

// Create a new stylesheet, optionally scoped to a DOM element.
function makeSheet(scope) {
  var style = document.createElement('style');
  document.head.appendChild(style);
  var sheet = style.sheet;

  if (scope) {
    style.setAttribute('scoped', "scoped");
    if (!scopedSupported) {
      scope.dataset[scopedStyleIdsProp] = (scope.dataset[scopedStyleIdsProp] || "") + " " +
        (sheet.scopedStyleId = makeScopedStyleId(scopedStyleId++));
    }
  }

  return sheet;
}

// Insert a CSS rule, given by selector(s) and declarations, into a sheet.
// If the scoped attribute was specified, and scoping is not supported,
// then emulate scoping, by adding a data-* attribute to the parent element,
// and rewriting the selectors.
function insert(sheet, [selectors, styles]) {
  if (sheet.scopedStyleId) {
    selectors = scopifySelectors(selectors, sheet.scopedStyleId);
  }

  var idx = sheet.insertRule(`${selectors} { }`, sheet.rules.length);
  var rule = sheet.rules[idx];

  if (typeof styles === 'string') { rule.style = styles; }
  else {
    // @TODO Fix this to be upward-friendly, and valueize style object.
    assign(rule.style, styles);
    //mirrorProperties(rule.style, styles);
  }

  return rule;
}

// `assignStyle` is an Upwardified function which on first invocation
// "assigns" hash passed as argument to the `style` attribute of `this`.
// When properties within the hash change, style attribute are updated.
function assignStyle() {
  return upwardifiedMerge(function() { return this.style; });
}

//HTMLElement.prototype.style = assignStyle;
//CSSStyleRule.prototype.style = assignStyle;

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
  this.deleteRule(idx);
  return this.insertRule(rule, idx);
};

//Object.assign(CSSStyleSheet.prototype, {
//              rule: upwardify(chainify(insertRule), replaceChild),

// Insert a rule (selectors plus values) into a stylesheet.
CSSStyleSheet.prototype.rule = function(selector, styles) {
  var idx = this.insertRule(`${selector} { }`, this.rules.length);
  var rule = this.rules[idx];
  // TODO: replace with assignStyle.
  assign(rule.style, styles);
  return this;
};

// Define CSS units on numbers, as non-enumerable properties on prototype.
// Cannot call as `12.px`; instead, try `12..px`, or `12 .px`.
if (upwardConfig.MODIFY_BUILTIN_PROTOTYPES) {
  [
    'em', 'ex', 'ch', 'rem', 'px', 'mm', 'cm', 'in', 'pt', 'pc', 'px',
    'vh', 'vw', 'vmin', 'vmax',
    'pct',
    'deg', 'grad', 'rad', 'turn',
    'ms', 's',
    'Hz', 'kHz'
  ].forEach(unit => defineProperty(Number.prototype, unit, {
    get() { return this + unit; }
  }));
}

export var transform =
  [
    'translate','translateX','translateY',
    'scale','scaleX','scaleY','scale3d','scaleZ',
    'rotate','rotateX','rotateY','rotateZ','rotate3d',
    'perspective','matrix','matrix3d',
    'skewX','skewY'
  ].reduce(
    (result, key) =>
      Object.defineProperty(result, key, {
        value: (...args) => `${key}(${args})`
      }),
    {}
  );


export default function UpStyle(rules, scope) {
  var sheet = makeSheet(scope);
  rules.forEach(rule => insert(sheet, rule));
  return sheet;
}
