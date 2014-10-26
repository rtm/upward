// Test harnesses
// ==============

// A test is defined with 'test', which returns a function.
// A group of tests is defined with `testGroup`, which also returns a function.
// Either one is executed by calling it with a "reporter".
// HTML and console reporters are provided.

// Setup.
import {spawn, timeout} from '../src/Asy';
import {makeStopwatch}  from '../src/Utl';

var {assign, create} = Object;

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

// Base class for reporters.
// Options include `hideCounts`, `hideTime`, `hidePasses`, and `hideSubtests`.
class Reporter {
  constructor(options = {}) {
    this.options = assign({}, options);
  }

  startGroup()     { return new this.constructor(options); }
  endGroup(group)  { 
    this.passes += group.passes;
    this.fails  += group.fails;
  }
  pass()           { this.passes++; return this; }
  fail()           { this.fails++;  return this; }
}

assign(Reporter.prototype, {passes: 0, fails: 0});

// Console reporter, which reports results on the console.
class ConsoleReporter extends Reporter {
  constructor(options = {}) {
    super(options);
  }
  pass(msg, time) {
    if (!this.options.hidePasses) {
      let str = '%c✓' + msg;
      if (!this.options.hideTime) { str += ' (%sms)'; }
      console.log(str, "color: green", time);
    }
    return super();
  }
  log(msg) {
    console.log(msg);
    return this;
  }
  fail(msg) {
    console.error(msg);
    return super();
  }
  startGroup(desc, options = {}) {
    console[this.options.hideSubtests ? 'groupCollapsed' : 'group'](desc);
    return new ConsoleReporter(assign(options, this.options));
  }
  endGroup(group) {
    console.groupEnd();
    if (!this.options.hideCounts) {
      let color = group.fails ? 'red' : 'green';
      console.log(`%c${group.passes} passes, ${group.fails} fails`, `color: ${color}`);
    }
    return super(group);
  }
}

// HTML reporter inserts output into the DOM.
class HtmlReporter extends Reporter {
  constructor(parent, tag, options = {}) {
    assign(this, {parent, tag});
    super(options);
  }

  elt()     { return document.createElement(this.tag); }
  append(c) { return this.parent.appendChild(c); }
  text(t)   { return document.createTextNode(t); }
  
  pass(msg) {
    var t = this.text(msg);
    var e = this.elt();
    e.appendChild(t);
    this.append(e);
    return super();
  }
  log(msg) {
    var e = this.elt();
    var t = this.text("LOG: " + msg);
    e.appendChild(t);
    this.append(e);
  }
  fail(msg) {
    var t = this.text(msg);
    var e = this.elt();
    var span = document.createElement('span');
    span.setAttribute('style', "color: red");
    span.appendChild(t);
    e.appendChild(span);
    this.append(e);
    return super();
  }
  startGroup(desc) {
    // @TODO put out the name of the group
    var ul = document.createElement('ul');
    this.parent.appendChild(ul);
    return new HtmlReporter(ul, 'li', options);
  }
}

// Test creators
// -------------

// Return a function to run a group of tests.
function testGroup(desc, tests) {
  return function(reporter) {
    return spawn(
      function *() {
        var group;
        yield group = reporter.startGroup(desc);
        for (var t of tests) {
          yield t(group);
        }
        yield reporter.endGroup(group);
      }
    );
  };
}

// Return a function to run a single test.
function test(desc, when, then) {
  var stopwatch = makeStopwatch();
  return reporter => Promise
    .resolve()
  //    .then  (_ => reporter.log(desc))
    .then  (stopwatch.start)
    .then  (_ => when(reporter))
    .then  (timeout())
    .then  (_ => then(reporter))
    .then  (stopwatch.stop)
    .then  (_ => reporter.pass(desc, stopwatch.time))
    .catch (e => reporter.fail(e))
  ;
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

  // Assertion libraries.
  assert,
  should,
  expect
};
