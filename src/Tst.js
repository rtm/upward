// Test harnesses
// ==============

// A test is defined with 'test', which returns a function.
// A group of tests is defined with `testGroup`, which also returns a function.
// Either one is executed by calling it with a "reporter".
// HTML and console reporters are provided.

// Setup.

import {spawn, timeout} from '../src/Asy';
import {makePropertyDescriptors} from '../src/Obj';

var {create} = Object;

// Reporters
// ---------

// Inherited prototype for all reporters.
var reporterPrototype = {
  startGroup()            { return this; },
  endGroup()              { },
  assert(desc, condition) { 
    if (condition) {
      this.succeed(desc);
    } else {
      this.fail(desc);
    }
  },
  success()               { this.successes++; },
  failure()               { this.failures++; },
  successes: 0,
  failures: 0,
  
};

// Console reporter, which reports messages and results on the console.
var consoleReporterPrototype = create(
  reporterPrototype,
  makePropertyDescriptors({
    succeed(msg)    { console.log('%c'+msg, "color: green"); this.success(); },
    log(msg)        { console.log(msg); },
    fail(msg)       { console.error(msg); this.failure(); },
    startGroup()    { console[this.collapsed ? 'groupCollapsed' : 'group']("Subtests");
                      return this;
                    },
    endGroup(group) { console.log(`${this.successes} successes, ${this.failures} failures`);
                      console.groupEnd(); }
  })
);

function consoleReporter(collapsed = false) {
  return create(
    consoleReporterPrototype,
    { collapsed: { value: collapsed } }
  );
}

// HTML reporter, which inserts messages and results into the DOM.
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

    startGroup() {
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

function *runAll(tests, reporter) {
  for (var t of tests) {
    yield t(reporter);
  }
}

function testGroup(desc, tests) {
  return function(reporter) {
    reporter.log(`testGroup: ${desc}`);
    var group = reporter.startGroup();
    spawn(function() { return runAll(tests, group); })
      .then(function() {
        reporter.endGroup(group); })
    ;
  };
}

function test(desc, set, check) {
  return function(reporter) {
    reporter.log(`test: ${desc}`);
    return Promise
      .resolve()
      .then(set)
      .then(timeout)
      .then(function() { check(reporter); })
      .catch(function(e) { reporter.fail(e); })
  };
}

export {
  consoleReporter,
  htmlReporter,
  test,
  testGroup
};

