// Test harness for upward
// =======================

import slcTests from './Slc';
import {testGroup, consoleReporter, htmlReporter} from '../src/Tst';

slcTests(consoleReporter());
//slcTest(htmlReporter(document.getElementById('tests'), 'h4'));
