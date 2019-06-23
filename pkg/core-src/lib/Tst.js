// Test harnesses
// ==============

// A test is defined with 'test', which returns a function.
// A group of tests is defined with `testGroup`, which also returns a function.
// Either one is executed by calling it with a "reporter".
// HTML and console reporters are provided.

// Setup.
import {wait}                 from './Asy';
import E                      from './Elt';
import {parseBody}            from './Ify';
import M                      from './Map';
import {assignAdd, mapObject} from './Out';
import R                      from './Ren';
import T                      from './Txt';
import U                      from './Upw';
import {makeStopwatch, sum}   from './Utl';


var {assign, create, keys} = Object;


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
function consoleReporter(reports, options = {}) {
  var hide = options.hide || {};
  (function _consoleReporter(reports) {
    reports.forEach(
      ({children, desc, status, counts, time, code, error}) => {
        let countStr = makeCounts(counts);
        let color    = statusInfo[status].color;
        let colorStr = `color: ${color}`;
        if (children) {
          let msg = desc;
          let collapse = hide.children || hide.passed && status === 'pass';
          if (!hide.counts) { msg = `${msg} (${countStr})`; }
          console[collapse ? 'groupCollapsed' : 'group']('%c' + msg, colorStr);
          _consoleReporter(children);
          console.groupEnd();
        } else {
          if (error) console.log('%c %s (%O)', colorStr, desc, error);
          else console.log('%c %s', colorStr, desc);
        }
      }
    );
  })(reports);
}

// HTML reporter; returns an Array of DOM nodes.
function htmlReporter(reports, options = {}) {
  var {hide} = options;
  hide = hide || {};

  function htmlReporterOne({children, desc, status, counts, time, code}) {
    var text = T(desc);
    var attrs = {class: {[status]: true}};
    if (children) {
      return E('details') .
        has([
          E('summary') . has([text, !hide.counts && T(` (${makeCounts(counts)})`)]) . is(attrs),
          E('div') . has(htmlReporter(children, options))
        ]) .
        is(hide.children ? {} : {open: true});
    } else {
      return E('div') . has(text) . is(attrs);
    }
  }

  return M(reports, htmlReporterOne);
}

// Test creators
// -------------

// To skip a test, or test group, or unskip it, call these on it,
// or chain with `.skip()` and `.unskip()`.
function skip  (test, s = true) { test._skip   = s; return test; }
function unskip(test, s = true) { test._unskip = s; return test; }

// Return a function to run a group of tests.
function testGroup(desc, tests = [], options = {}) {

  async function _testGroup(reporter, skipping) {
    var counts = {fail: 0, pass: 0, skip: 0};
    var children = [];
    const time = 0;
    var group = {desc, children: U(children), counts, time, status: 'skip'};

    // Run each test in the group.
    for (var t of tests) {
      await t(children, !t._unskip && (t._skip || skipping));
      if (options.pause) { await wait(options.pause); }
    }

    children.forEach(g => assignAdd(counts, g.counts));
    let allSkip = counts.skip && !keys(counts).some(k => k !== 'skip' && counts[k]);
    group.status = allSkip ? 'skip' : counts.fail ? 'fail' : 'pass';
    group.time = sum(children.map(c => c.time));
    reporter.push(group);
  }


  // Allow skipping/unskipping by chaining: `testGroup(...).skip()`.
  _testGroup.skip   = function(s) { return skip  (this, s); };
  _testGroup.unskip = function(s) { return unskip(this, s); };
  _testGroup.push   = function(...t) { tests.push(...t); return this; };

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
        .then  (_ => fn(chai))
        .then  (
          _ => status = 'pass',
          e => {
            status = 'fail';
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
function runTests(tests, options = {}, skipping = false) {
  var result = [];
  return tests(result, skipping) . then(() => result);
}

// Exports
// -------
export {
  // Reporters.
  consoleReporter,
  htmlReporter,

  // Test creators.
  test,
  testGroup,
  skip,
  unskip,

  // CSS rules
  testCssRules,

  // run tests
  runTests
};
