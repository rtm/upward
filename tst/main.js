// Test harness for upward
// =======================

//import assTests from './Ass';
import funTests from './Fun';
import ifyTests from './Ify';
//import mapTests from './Map';
//import revTests from './Rev';
//import slcTests from './Slc';
//import srtTests from './Srt';
//import tstTests from './Tst';
//import upwTests from './Upw';
import {testGroup as utlTests} from '../src//Utl';

import {runTests, testGroup, skip, consoleReporter, htmlReporter, testCssRules} from '../src/Tst';
import UpStyle from '../src/Css';
import {E, T} from '../src/Up';

var tests = testGroup(
  "All tests",
  [
    funTests,
//    upwTests
//    slcTests,
//    tstTests,
//    revTests,
//    srtTests,
//    mapTests,
    ifyTests,
//    assTests,
    //    renTests,
    utlTests()
  ],
  { pause: 1000 }
);

runTests(tests) . then(reports => consoleReporter(reports, {hide: {passed: true}}));
//var results = runTests(tests);
var testDiv = E('div');//DIV();//htmlReporter(results));
//setTimeout(function() {
//  consoleReporter(results);
//});

// Styles
// ------
UpStyle([
  ["detail",        { marginLeft: (24).px   }],
  ["details > div", { marginLeft: (48).px   }],
  ["body",          { fontFamily: "sans-serif" }]
]);

document.body.appendChild(E('h1') . has([T("Upward Tests")]));
document.body.appendChild(testDiv); // GO!
