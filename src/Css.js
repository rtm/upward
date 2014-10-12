export function makeStyles(elt, css) {
  var style = document.createElement('style');
  var sheet;

  style.appendChild(document.createTextNode(""));
  style.setAttribute('scoped', true);
  elt.appendChild(style);
  sheet = style.sheet;
  
  (css || []).forEach(function(rule) {
    Object.assign(
      sheet.cssRules[
        sheet.insertRule(
          [].concat(rule[0]).join(',') + '{}', 
          sheet.cssRules.length)
      ].style,
				...[].concat(rule[1])
    );
  });
}

// Create a new stylesheet.
// Optionally provide a parent and/or a `scoped` attribute.
function createStyleSheet({parent = document.head, scoped} = {}) {
	var style = document.createElement('style');
	if (scoped) {
		style.setAttribute('scoped', true);
	}
	parent.appendChild(style);
	return style.sheet;
}

// `assignStyle` is an Upwardified function which on first invocation 
// "assigns" hash passed as argument to the `style` attribute of `this`.
// When properties within the hash change, style attribute are updated.
function assignStyle() {
	return upwardifiedMerge(function() { return this.style; });
};

//HTMLElement.prototype.style = assignStyle;
//CSSStyleRule.prototype.style = assignStyle;

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
  this.deleteRule(idx);
  return this.insertRule(rule, idx);
};

//Object.assign(CSSStyleSheet.prototype, {
//		rule: upwardify(chainify(insertRule), replaceChild),

// Insert a rule (selectors plus values) into a stylesheet.
CSSStyleSheet.prototype.rule = function(selector, styles) {
	var idx = this.insertRule(`${selector} { }`, this.rules.length);
	var rule = this.rules[idx];
  Object.assign(rule.style, styles);
	return this;
};

export {
	createStyleSheet
};
