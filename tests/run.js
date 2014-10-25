// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';

import {testGroup, consoleReporter, htmlReporter} from '../src/Tst';

var reporter = htmlReporter(document.getElementById('tests'), 'h4');
reporter = consoleReporter({collapsed: true});

testGroup(
  "All tests",
  [
    tstTests,
    slcTests
  ]
)(reporter);

