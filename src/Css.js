// Build CSS sheets and rules.
// ===========================

// Setup.
import {dasherize} from './Str';
import {mirrorProperties} from './Obs';

var {assign} = Object;

var scopedSupported = 'scoped' in document.createElement('style');

var scopedStyleId = 0;
var scopedStyleIdsProp = "scopedStyleIds";
var makeScopedStyleId = id => 's' + id;

// "Scopify" a set of selectors to an element identifed by a data-scoped-style-ids attribute.
// Each selector is turned into two selectors.
// The first places the `[data-...]` selector in front, to address descendnats.
// The second attaches it to the first subslector, to address the element itself.
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

// Create a new stylesheet.
// Optionally provide a parent and/or a `scoped` attribute.
function createCSSStyleSheet(parent = document.head, scoped = false) {
  var style = document.createElement('style');
  document.head.appendChild(style);
  var sheet = style.sheet;
  
  if (scoped) { 
    style.setAttribute('scoped', "scoped"); 
    if (!scopedSupported) {
      parent.dataset[scopedStyleIdsProp] = (parent.dataset[scopedStyleIdsProp] || "") + " " +
        (sheet.scopedStyleId = makeScopedStyleId(scopedStyleId++));
    }
  }

  return sheet;
}

// Insert a CSS rule, given by selector(s) and declarations, into a sheet.
// If the scoped attribute was specified, and scoping is not supported,
// then emulate scoping, by adding a data-* attribute to the parent element,
// and rewriting the selectors.
function insertCSSStyleRule(sheet, [selectors, styles]) {
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

function insertCSSStyleRules(sheet, rules) {
  rules.forEach(rule => insertCSSStyleRule(sheet, rule));
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
  assign(rule.style, styles);
  return this;
};

export {
  createCSSStyleSheet,
  insertCSSStyleRules
};
