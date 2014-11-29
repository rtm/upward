import {U, createCSSStyleSheet, insertCSSStyleRules} from '../src/U';
var {assign, keys} = Object;

var theme = U({
});

var setTheme = t => assign(theme, themes[t]);
var getThemeNames = _ => keys(themes);

var themes = {
	sunset: {
		bodyBackgroundColor: "wheat"
	}
};

setTheme("sunset");

insertCSSStyleRules(createCSSStyleSheet(), [

  ["body", { 
		fontFamily : 'sans-serif',
		backgroundColor: theme.bodyBackgroundColor
	}],

  ["h3", { 
		backgroundColor: 'brown', 
		color: 'white', 
		padding: '6px'
	}],

  [".code", { 
		whiteSpace: 'pre', 
		fontFamily: 'monospace', 
		backgroundColor: 'pink', 
		margin: '12px 40px', 
		padding: '12px'
	}],

  [".result", { 
		backgroundColor: 'beige', 
		margin: '12px 40px', 
		padding: '12px'
	}],

  [".hide", { 
		display: 'none'
	}]

]);

export {
  setTheme,
  getThemeNames
}
