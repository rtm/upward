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

// `assignStyle` is an Upwardified function which on first invocation 
// "assigns" hash passed as argument to the `style` attribute of `this`.
// When properties within the hash change, style attribute are updated.
function assignStyle() {
	return upwardifiedMerge(function() { return this.style; });
};

HTMLElement.prototype.style = assignStyle;
CSSStyleRule.prototype.style = assignStyle;

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
  this.deleteRule(idx);
  return this.insertRule(rule, idx);
};

// Units





  
  

