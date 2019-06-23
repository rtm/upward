// CSS sheet and rule insertion sample.
// ====================================

import {E, T, UpStyle} from 'upward/src/Up';
var {assign, keys} = Object;
var dom;

//===START
dom = E('div') . has(T("Look Ma, I'm styled"));

var rules = [                              // Define the rules as an array
  ["div", {                                // of pairs of selector
    color: 'white',                        // and properties object.
    backgroundColor: 'blue',
    fontWeight: 'bold'
  }]
];

UpStyle(rules, dom);                       // Insert the rules (scoped).
//===END

export default dom;
