/* jshint esnext: true */

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
		);;
	});
}


	
	

