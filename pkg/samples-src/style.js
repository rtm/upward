// Styling for samples.
// ====================

import {U, UpStyle} from 'upward';

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

UpStyle([

  ["body", {
    fontFamily : 'Lato, sans-serif',
    backgroundColor: theme.bodyBackgroundColor,
    paddingLeft: '12px',
    paddingRight: '12px'
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
    padding: '12px',
    fontSize: 'larger'
  }],

  [".result", {
    backgroundColor: 'beige',
    margin: '12px 40px',
    padding: '12px'
  }],

  [".hide", {
    display: 'none'
  }],

  ["code", {
    fontSize: 'larger',
    backgroundColor: 'lightgray',
    border: "1px solid gray",
    paddingLeft: "0.2em",
    paddingRight: "0.2em"
  }]

]);

export {
  setTheme,
  getThemeNames
}
