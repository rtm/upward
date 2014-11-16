// Test harness for upward
// =======================

import comTests from './Com';
import upwTests from './Upw';
//import slcTests from './Slc';
//import tstTests from './Tst';
//import revTests from './Rev';
//import srtTests from './Srt';
//import mapTests from './Map';
//import assTests from './Ass';
//import funTests from './Fun';
//import renTests from './Ren';

import {TEXT, DIV} from '../src/Dom';
import R           from '../src/Ren';
import {runTests, testGroup, skip, consoleReporter, htmlReporter, testCssRules} from '../src/Tst';
import {createCSSStyleSheet, insertCSSStyleRules} from '../src/Css';

var tests = testGroup(
  "All tests",
  [
    comTests.unskip(),
    upwTests
//    slcTests,
//    tstTests,
//    revTests,
//    srtTests,
//    mapTests,
//    funTests,
//    assTests,
//    renTests
  ],
  { pause: 1000 }
);

var results = runTests(tests, {}, true);
var testDiv = DIV();//htmlReporter(results));
setTimeout(function() {
  consoleReporter(results);
});

// Styles
// ------
var sheet = createCSSStyleSheet(testDiv, true);
insertCSSStyleRules(sheet, [
  ["detail",       { marginLeft: "24px"   }],
  ["details > div", { marginLeft: "48px"   }],
]);
insertCSSStyleRules(sheet, testCssRules);

var sheet2 = createCSSStyleSheet();
insertCSSStyleRules(sheet2, [
  ["body",          { fontFamily: "sans-serif" }]
]);

document.body.appendChild(R('h1', [TEXT("Upward Tests")]));
document.body.appendChild(testDiv); // GO!
