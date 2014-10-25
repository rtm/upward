// Test harness for upward
// =======================

import slcTests from './Slc';
import tstTests from './Tst';

import {testGroup, consoleReporter, htmlReporter} from '../src/Tst';

tstTests(consoleReporter());
//slcTest(htmlReporter(document.getElementById('tests'), 'h4'));
