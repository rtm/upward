import {UpElement, UpText, UpSheet, UpRules} from '../src/Up';
var {assign, keys} = Object;
var sheet, dom;

//===START
dom = UpElement('div', [UpText("Look Mom, I'm styled")]);

var sheet = UpSheet(dom,true);             // Create a scoped stylesheet

var rules = [                              // Define the rules as an array
  ["div", {                                // of pairs of selector
    color: 'white',                        // and properties object.
    backgroundColor: 'blue',
    fontWeight: 'bold'
  }]
];

UpRules(sheet, rules);                     // Insert the rules.
//===END

export default dom;
