import {UpElement, UpSheet, UpRules} from '../src/Up';
var {assign, keys} = Object;
var sheet, dom;

//===START
var sheet = UpSheet(                       // Create a stylesheet
  document.getElementById('css-example'),  // scoped to this element.
  true
);

var rules = [                              // Define the rules as an array
  ["div", {                                // or selector
    color: 'white',                        // and properties pairs.
    backgroundColor: 'blue'
  }]
];

UpRules(sheet, rules);                     // Insert the rules.
//===END
dom = UpElement('div');

export default dom;
