// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';
import {BUTTON} from '../src//U';

import {testGroup, ConsoleReporter, HtmlReporter} from '../src/Tst';

var reporter = new HtmlReporter(document.getElementById('tests'), 'h4');
reporter = new ConsoleReporter({collapsed: false});

var tests = testGroup(
  "All tests",
  [
    tstTests,
    slcTests
  ]
);

document.body.appendChild(BUTTON("Run tests", _ => tests(reporter)));
