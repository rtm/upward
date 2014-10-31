// Test harnesses
// ==============

// A test is defined with 'test', which returns a function.
// A group of tests is defined with `testGroup`, which also returns a function.
// Either one is executed by calling it with a "reporter".
// HTML and console reporters are provided.

// Setup.
import keepRendered     from '../src/Ren';
import {spawn, timeout} from '../src/Asy';
import {makeStopwatch, sum}  from '../src/Utl';
import {assignAdd}      from '../src/Obj';
import {parseBody}      from '../src/Fun';

const INSTALL_SHOULD = false;

var {assign, create, keys} = Object;

// Assertion libraries.
// --------------------
var {expect, should, assert} = chai;

assign(chai.config, {
  includeStack: true,
  showDiff: true
});

// `should` requires initialization; it pollutes the Object prototype.
if (INSTALL_SHOULD) { should = should(); }

// Reporters
// ---------

var statusInfo = {
  pass: { color: 'green',  mark: '✓'},
  fail: { color: 'red',    mark: '✗'},
  skip: { color: 'orange', mark: '❖'}
};

// CSS rules for HTML output. Stick these where you will.
var testCssRules = [];
keys(statusInfo).forEach(
  status => testCssRules.push(
    ['.' + status, {color: statusInfo[status].color}],
    ['.' + status + "::before", { content: `"${statusInfo[status].mark} "` }]
  )
);

var statuses = keys(statusInfo);

function makeCounts(counts) {
  return keys(counts)
    .filter(status => counts[status])
    .map   (status => `${counts[status]} ${status}`).join(', ');
}

// Console reporter, which reports results on the console.
function consoleReporter(reports, {hide}) {
  hide = hide || {};
  (function _consoleReporter(reports) {
    reports.forEach(
      ({children, desc, status, counts}) => {
        let countStr = makeCounts(counts);
        let color    = statusInfo[status].color;
        let colorStr = `color: ${color}`;
        if (children) {
          let msg = desc;
          if (!hide.counts) { msg = `${msg} (${countStr})`; }
          console[hide.children ? 'groupCollapsed' : 'group']('%c' + msg, colorStr);
          _consoleReporter(children);
          console.groupEnd();
        } else {
          console.log('%c' + desc, colorStr);
        }
      }
    );
  })(reports);
}

// HTML reporter

// Test creators
// -------------

// To skip a test, or test group, or unskip it, call these on it,
// or chain with `.skip()` and `.unskip()`.
function skip  (test, s = true) { test._skip   = s; return test; }
function unskip(test, s = true) { test._unskip = s; return test; }

// Return a function to run a group of tests.
function testGroup(desc, tests, options = {}) {
  
  function _testGroup(reporter, skipping) {
    return spawn(
      
      function *() {
        var counts = {fail: 0, pass: 0, skip: 0};
        var children = [];
        var group = {desc, children, counts, time: 0, status: 'skip'};
        reporter.push(group);

        for (var t of tests) {
          yield t(children, !t._unskip && (t._skip || skipping));
        }

        children.forEach(g => assignAdd(counts, g.counts));
        let allSkip = counts.skip && !keys(counts).some(k => k !== 'skip' && counts[k]);
        group.status = allSkip ? 'skip' : counts.fail ? 'fail' : 'pass';
        group.time = sum(children.map(c => c.time));
      }
      
    );
  }

  // Allow skipping/unskipping by chaining: `testGroup(...).skip()`.
  _testGroup.skip   = function(s) { return skip  (this, s); };
  _testGroup.unskip = function(s) { return unskip(this, s); };
  return _testGroup;
}

// Return a function to run a single test.
function test(desc, fn, options = {}) {
  var status, msg, time;
  var code = parseBody(fn);
  var stopwatch = makeStopwatch();

  function _test(reporter, skipping) {
    var counts = {fail: 0, skip: 0, pass: 0};
    var time = 0;
    var status = 'skip';
    var result = {desc, counts, time, code, status};

    if (skipping) {
      return Promise
        .resolve()
        .then(_ => {
          counts.skip++;
          reporter.push(result);
        })
      ;
    } else {
      return Promise
        .resolve()
        .then  (stopwatch.start)
        .then  (_ => fn(reporter))
        .then  (
          _ => status = 'pass',
          e => {
            status = 'fail';
            if (typeof e === 'object' && e.message) { e = e.message; }
            result.error = e;
          }
        )
        .then  (_ => {
          stopwatch.stop();
          result.time = stopwatch.time;
          counts[status]++;
          result.status = status;
          reporter.push(result);
        })
      ;
    }
  }

  // Allow skipping/unskipping by chaining: `test(...).skip()`.
  _test.skip   = function(s) { return skip  (this, s); };
  _test.unskip = function(s) { return unskip(this, s); };
  return _test;
}

// Run tests, returning a promise with the results.
function runTests(tests) {
  var result = [];
  return tests(result).then(_ => result);
}

// Exports
// -------
export {
  // Reporters.
  consoleReporter,
//  htmlReporter,

  // Test creators.
  test,
  testGroup,
  skip,
  unskip,

  // Assertion libraries.
  assert,
  should,
  expect,

  // CSS rules
  testCssRules,

  // run tests
  runTests
};
