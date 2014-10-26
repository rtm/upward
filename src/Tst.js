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
    this.time   += group.time;
  }
  report(result)   {
    if (result.pass) { this.passes++; }
    else { this.fails++; }
    this.time += result.time;
  }
}

assign(Reporter.prototype, {passes: 0, fails: 0, time: 0});

// Console reporter, which reports results on the console.
class ConsoleReporter extends Reporter {
  constructor(options = {}) {
    super(options);
  }

  report(result) {
    var {msg, pass, time} = result;
    var {hideTime, hidePasses} = this.options;

    if (!hideTime) { msg = `${msg} (${time}ms)`; }
    if (pass) {
      if (!hidePasses) { console.log('%c✓' + msg, "color: green"); }
    } else { console.error(msg); }
    return super(result);
  }

  log(msg) {
    console.log(msg);
    return this;
  }

  startGroup(desc, options = {}) {
    console[this.options.hideSubtests ? 'groupCollapsed' : 'group'](desc);
    return new ConsoleReporter(assign(options, this.options));
  }

  endGroup(group) {
    console.groupEnd();
    super(group);
    if (!this.options.hideCounts) {
      let color = group.fails ? 'red' : 'green';
      let msg = `%c${group.passes} passes, ${group.fails} fails`;
      if (!group.hideTime) { msg += ` (${this.time}ms)`; }      
      console.log(msg, `color: ${color}`);
    }
    return this;
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
  var pass = true, msg = desc, time;

  return reporter => {
    return Promise
      .resolve()
      .then  (  stopwatch.start  )

      .then  (_ => when(reporter))
      .then  (     timeout()     )
      .then  (_ => then(reporter))

      .then  (null, e => { pass = false; msg += ": " + e; })

      .then  (_ => {
        stopwatch.stop();
        time = stopwatch.time;
        reporter.report({pass, msg, time});
      })
    ;
  }
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
