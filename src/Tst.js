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
  skip: { color: 'yellow', mark: '?'}
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

  report({status, time}) {
    this.counts[status] = (this.counts[status] || 0) + 1;
    this.time += time;
  }
}

// Console reporter, which reports results on the console.
class ConsoleReporter extends Reporter {
  constructor(options = {}) {
    super(options);
  }

  report(result) {
    var {msg, status, time} = result;
    var {hide = {}} = this.options;

    if (!hide.time) { msg = `${msg} (${time}ms)`; }
    if (!hide[status]) {
      switch (status) {
      case 'skip':
      case 'pass':
        console.log('%c%s' + msg, `color: ${statusInfo[status].color}`, statusInfo[status].mark);
        break;
      case 'fail':
        console.error(msg);
        break;
      }
    }
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
function test(desc, fn) {
  var stopwatch = makeStopwatch();
  var status, msg, time;

  return reporter => {
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
