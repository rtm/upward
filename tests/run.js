// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';
import revTests from './Rev';
import srtTests from './Srt';

import {BUTTON} from '../src/U';

import {testGroup, skip, ConsoleReporter, HtmlReporter} from '../src/Tst';

var reporter = new HtmlReporter(document.getElementById('tests'), {hide: {children: true}});
//reporter = new ConsoleReporter({collapsed: false});

var tests = testGroup(
  "All tests",
  [
    tstTests,
    skip(slcTests),
    revTests,
    srtTests
  ]
);

document.body.appendChild(BUTTON("Run tests", _ => tests(reporter)));
