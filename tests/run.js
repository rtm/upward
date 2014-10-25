// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';
import {BUTTON} from '../src//U';

import {testGroup, consoleReporter, htmlReporter} from '../src/Tst';

var reporter = htmlReporter(document.getElementById('tests'), 'h4');
reporter = consoleReporter({collapsed: true});

document.body.appendChild(BUTTON("Run tests", go));
                          
var tests = testGroup(
  "All tests",
  [
    tstTests,
    slcTests
  ]
);

function go() {
  tests(reporter);
}

