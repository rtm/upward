// Test harnesses
// ==============

// A test is defined with 'test', which returns a function.
// A group of tests is defined with `testGroup`, which also returns a function.
// Either one is executed by calling it with a "reporter".
// HTML and console reporters are provided.

// Setup.
import {spawn, timeout} from '../src/Asy';
import {makeStopwatch}  from '../src/Utl';
import {assignAdd}      from '../src/Obj';

var {assign, create, keys} = Object;

// Assertion libraries.
// --------------------
var {expect, should, assert} = chai;

assign(chai.config, {
  includeStack: true,
  showDiff: true
});

// `should` requires initialization.
should = should();

// Reporters
// ---------

var statusInfo = {
  pass: { color: 'green',  mark: '✓'},
  fail: { color: 'red',    mark: 'x'},
  skip: { color: 'orange', mark: '?'}
};

var statuses = keys(statusInfo);

// Base class for reporters.
// Options include a `hide` property with properties `counts`, `time`, `pass`, `fail`, and `skip`.
class Reporter {
  constructor(options = {}) {
    this.options = assign({}, options);
    this.counts = {};
    this.time = 0;
  }

  startGroup()     { return new this.constructor(options); }

  endGroup({counts, time})  {
    assignAdd(this.counts, counts);
    this.time += time;
  }

  pass() { }
  fail() { }
  skip() { }
  
  report(result) {
    var {msg, status, time} = result;
    var {hide = {}} = this.options;

    if (!hide[status]) {
      if (!hide.time) { msg = `${msg} (${time}ms)`; }
      msg = statusInfo[status].mark + msg;
      this[status](msg, statusInfo[status].color);
    }

    this.counts[status] = (this.counts[status] || 0) + 1;
    this.time += time;
  }
}

// Console reporter, which reports results on the console.
class ConsoleReporter extends Reporter {
  constructor(options = {}) {
    super(options);
  }

  pass(msg, color) {
    console.log('%c' + msg, `color: ${color}`);
  }

  fail(msg) {
    console.error(msg);
  }

  skip(msg, color) {
    console.log('%c' + msg, `color: ${color}`);
  }

  startGroup(desc, options = {}) {
    var {hide = {}} = this.options;
    console[hide.cihldren ? 'groupCollapsed' : 'group'](desc);
    return new ConsoleReporter(assign(options, this.options));
  }

  endGroup(group) {
    var {counts, options: {hide = {}}, time} = group;
    console.groupEnd();
    super(group);
    if (!hide.counts) {
      let msg = keys(counts)
          .map(status => `${counts[status]} ${status}`)
          .join(', ');
      let color = counts.fail ? 'red' : 'green';
      if (!hide.time) { msg += ` (${time}ms)`; }      
      console.log('%c' + msg, `color: ${color}`);
    }
    return this;
  }
}

// HTML reporter inserts output into the DOM.
class HtmlReporter extends Reporter {
  constructor(parent, options = {}) {
    this.parent = parent;
    super(options);
  }

  elt(tag)  { return document.createElement(tag); }
  append(c) { return this.parent.appendChild(c); }
  text(t)   { return document.createTextNode(t); }
  
  pass(msg, color) {
    var t = this.text(msg);
    var e = this.elt('div');
    e.style.color = color;
    e.appendChild(t);
    this.append(e);
  }
  skip(msg, color) {
    var t = this.text(msg);
    var e = this.elt('div');
    e.style.color = color;
    e.appendChild(t);
    this.append(e);
  }
  fail(msg, color) {
    var t = this.text(msg);
    var e = this.elt('div');
    e.style.color = color;
    e.appendChild(t);
    this.append(e);
  }

  startGroup(desc) {
    var {hide = {}} = this.options;
    var details = this.elt('details');
    if (!hide.children) { details.setAttribute('open', true); }
    var summary = this.summaryElement = this.elt('summary');
    details.appendChild(summary);
    var desc = this.text(desc);
    summary.appendChild(desc);
    this.parent.appendChild(details);
    return new HtmlReporter(details, this.options);
  }

  endGroup(group) {
    var {counts, options: {hide = {}}, time} = group;
    super(group);
    if (!hide.counts) {
      let msg = keys(counts)
          .map(status => `${counts[status]} ${status}`)
          .join(', ');
      let color = counts.fail ? 'red' : 'green';
      if (!hide.time) { msg += ` (${time}ms)`; }
      this.summaryElement.textContent += ` [${msg}]`;
      this.summaryElement.style.color = color;
    }
    return this;
  }

}

// Test creators
// -------------

// To skip a test, or test group, or unskip it, call these.
function skipify  (test, s = true) { test._skip   = s; return test; }
function unskipify(test, s = true) { test._unskip = s; return test; }

// Return a function to run a group of tests.
function testGroup(desc, tests, options = {}) {
  var {skip, unskip} = options;
  
  function _testGroup(reporter, skipping) {
    return spawn(
      
      function *() {
        var group;
        yield group = reporter.startGroup(desc);
        for (var t of tests) {
          yield t(group, !t._unskip && (t._skip || skipping));
        }
        yield reporter.endGroup(group);
      }
      
    );
  }

  // Allow skipping/unskipping by chaining: `testGroup(...).skip()`.
  _testGroup.skip   = function(s) { return skipify  (this, s); };
  _testGroup.unskip = function(s) { return unskipify(this, s); };
  return _testGroup;
}

// Return a function to run a single test.
function test(desc, fn, options = {}) {
  var status, msg, time;
  var stopwatch = makeStopwatch();
  var {unskip, skip} = options;

  return function _test(reporter, skipping) {
    if (skipping) {
      return Promise
        .resolve()
        .then(_ => reporter.report({status: 'skip', msg: desc, time: 0}))
      ;
    } else {
      return Promise
        .resolve()
        .then  (stopwatch.start)
        .then  (_ => fn(reporter))
        .then  (
          _ => { status = 'pass'; msg = desc; },
          e => { status = 'fail'; msg = desc + ": " + e; }
        )
        .then  (_ => {
          stopwatch.stop();
          time = stopwatch.time;
          reporter.report({status, msg, time});
        })
      ;
    }
  }

  // Allow skipping/unskipping by chaining: `test(...).skip()`.
  _test.skip   = function(s) { return skipify  (this, s); };
  _test.unskip = function(s) { return unskipify(this, s); };
  return _test;

}

// Exports
// -------
export {
  // Reporters.
  ConsoleReporter,
  HtmlReporter,

  // Test creators.
  test,
  testGroup,
  skipify,
  unskipify,

  // Assertion libraries.
  assert,
  should,
  expect
};
