// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';
import {BUTTON} from '../src//U';

import {testGroup, skipify, ConsoleReporter, HtmlReporter} from '../src/Tst';

var reporter = new HtmlReporter(document.getElementById('tests'), {});
//reporter = new ConsoleReporter({collapsed: false});

var tests = testGroup(
  "All tests",
  [
    tstTests,
    skipify(slcTests)
  ]
);

document.body.appendChild(BUTTON("Run tests", _ => tests(reporter)));
