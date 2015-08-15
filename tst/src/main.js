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
import {utlTests} from '..';

import {runTests, testGroup, skip, consoleReporter, htmlReporter} from '../../src/Tst';

import './style';


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


var reportsDiv = document.getElementById('reports');

runTests(tests) . then(
  reports =>
    htmlReporter(reports) . forEach(
      report =>
        reportsDiv.appendChild(report)));
