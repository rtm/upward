// Test harnesses
// ==============

// A test is defined with 'test', which returns a function.
// A group of tests is defined with `testGroup`, which also returns a function.
// Either one is executed by calling it with a "reporter".
// HTML and console reporters are provided.

// Setup.

import {spawn, timeout} from '../src/Asy';
import {makePropertyDescriptors} from '../src/Obj';

var {assign, create} = Object;

// Assertion libraries.
// --------------------
var {expect, should, assert} = chai;

assign(chai.config, {
  includeStack: true,
  showDiff: true
});

should = should();

// Reporters
// ---------

// Inherited prototype for all reporters.
var reporterPrototype = {
  startGroup()            { return this; },
  endGroup(group)         { this.count(group); },
  count(group)            {
    this.successes += group.successes;
    this.failures  += group.failures;
  },
  success()               { this.successes++; return this; },
  failure()               { this.failures++;  return this; },
  successes: 0,
  failures: 0,
  
};

// Null reporter does nothing but count results.
function nullReporter() {
  return create(nullReporterPrototype);
}

var nullReporterPrototype = create(
  reporterPrototype,
  makePropertyDescriptors({
    startGroup()     { return nullReporter(); },
    endGroup(group)  { this.count(group); },
    succeed()        { return this.success(); },
    fail()           { return this.failure(); }
  })
);

// Console reporter, which reports messages and results on the console.
var consoleReporterPrototype = create(
  reporterPrototype,
  makePropertyDescriptors({
    succeed(msg)    {
      console.log('%c'+msg, "color: green");
      return this.success();
    },
    log(msg) {
      console.log(msg);
      return this;
    },
    fail(msg) {
      console.error(msg);
      return this.failure();
    },
    startGroup(desc)    {
      console[this.collapsed ? 'groupCollapsed' : 'group'](desc);
      return consoleReporter(this.collapsed);
    },
    endGroup(group) {
      console.log(`${this.successes} successes, ${this.failures} failures`);
      console.groupEnd();
      this.count(group);
      return this;
    }
  })
);

function consoleReporter(collapsed = false) {
  return create(
    consoleReporterPrototype,
    { collapsed: { value: collapsed } }
  );
}

// HTML reporter inserts messages and results into the DOM.
var htmlReporterPrototype = create(
  reporterPrototype,
  makePropertyDescriptors({
    elt() { return document.createElement(this.tag); },
    append(c) { return this.parent.appendChild(c); },
    text(t) { return document.createTextNode(t); },
    
    succeed(msg) {
      var t = this.text(msg);
      var e = thsi.elt();
      e.appendChild(t);
      this.append(e);
      this.success();
    },
    
    log(msg) {
      var e = this.elt();
      var t = this.text("LOG: " + msg);
      e.appendChild(t);
      this.append(e);
    },

    fail(msg) {
      var t = this.text(msg);
      var e = this.elt();
      var span = document.createElement('span');
      span.setAttribute('style', "color: red");
      span.appendChild(t);
      e.appendChild(span);
      this.append(e);
      this.failure();
    },

    startGroup(desc) {
      // @TODO put out the name of the group
      var ul = document.createElement('ul');
      this.parent.appendChild(ul);
      return htmlReporter(ul, 'li');
    },
  })
);

function htmlReporter(parent, tag) {
  return create(
    htmlReporterPrototype,
    makePropertyDescriptors({parent, tag})
  );
}

// Generator for running a set of tests against a reporter via `spawn`.
function *runAll(tests, reporter) {
  for (var t of tests) {
    yield t(reporter);
  }
}

// Test creators
// -------------

// Return a function to run a group of tests.
function testGroup(desc, tests) {
  return function(reporter) {
    var group = reporter.startGroup(desc);
    return spawn(function() { return runAll(tests, group); })
      .then(function(reporter) {
        return reporter.endGroup(group); })
    ;
  };
}

// Return a function to run a single test.
function test(desc, when, then) {
  return reporter => Promise
    .resolve()
//    .then  (_ => reporter.log(desc))
    .then  (_ => when(reporter))
    .then  (timeout())
    .then  (_ => then(reporter))
    .then  (_ => reporter.succeed(desc))
    .catch (e => reporter.fail(e))
  ;
}

// Exports
// -------
export {
  // Reporters.
  consoleReporter,
  htmlReporter,
  nullReporter,

  // Test creators.
  test,
  testGroup,

  // Assertion libraries.
  assert,
  should,
  expect
};
