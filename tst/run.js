// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';
import revTests from './Rev';
import srtTests from './Srt';
import mapTests from './Map';
import assTests from './Ass';
import funTests from './Fun';
import renTests from './Ren';

import {BUTTON} from '../src/U';

import {runTests, testGroup, skip, consoleReporter, testCssRules} from '../src/Tst';
import {createCSSStyleSheet, insertCSSStyleRules} from '../src/Css';

var testDiv = document.createElement('div');

document.body.appendChild(testDiv);

// Styles
// ------
var sheet = createCSSStyleSheet(testDiv, true);

insertCSSStyleRules(sheet, [
  ["details > *",   { marginLeft: "24px"   }],
  ["details > div", { marginLeft: "48px"   }],
]);
insertCSSStyleRules(sheet, testCssRules);

var sheet2 = createCSSStyleSheet();
insertCSSStyleRules(sheet2, [
  ["body",          { fontFamily: "sans-serif" }]
]);


//var reporter = new HtmlReporter(testDiv, {hide: {children: true, time: true}});
//reporter = new ConsoleReporter({collapsed: false});

var tests = testGroup(
  "All tests",
  [
    tstTests,
    slcTests,
    revTests,
    srtTests,
    mapTests,
    funTests,
    assTests,
    renTests.unskip()
  ]
);

runTests(tests).then(
  v => consoleReporter(v, {hide: {children: true}})
);
