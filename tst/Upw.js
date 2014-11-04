// Unit tests for Upw module.

import {test, testGroup, assert} from '../src/Tst';
import {Upwardable, isUpwardable} from '../src/Upw';
import {invert, identity, debugify} from '../src/Fun';
import {propGetter, propValueGetter, valueize} from '../src/Obj';
import {observeObject} from '../src/Obs';

var {observe} = Object;

export default testGroup(
  "module Upw (upwardables)",
  [

    function() {
      var a;
      var spy = sinon.spy();
      return testGroup(
        "Basic operation",
        [
          test("create upwardable",         _ => a = Upwardable(5)),
          test("result is upwardable",      _ => assert.ok(isUpwardable(a))),
          test("when value is changed",     _ => { Object.observe(a, spy); a.val = 99; }),
          test("callback is called",        _ => assert(spy.called))
        ]
      );
    }(),
    
    function() {
      var a;
      var b = [1, 2, 3];
      var spy = sinon.spy();
      return testGroup(
        "Upwardable arrays",
        [
          test("create upwardable array",   _ => a = Upwardable(b)),
          test("when value is changed",     _ => { Object.observe(a, spy); b[0] = 99; }),
          test("callback is called",        _ => assert(spy.called))
        ]
      );
    }(),

    function() {
      var u;
      var b = {x: 1, y: 2};
      var spy = sinon.spy();
      return testGroup(
        "Upwardable object",
        [
          test("create upwardable object",  _ => u = Upwardable(b)),
          test("when value is changed",     _ => { Object.observe(u, spy); b.x = 2; }),
          test("callback is called",        _ => assert(spy.called))
        ]
      );
    }(),

    function() {
      var five = Upwardable(5);
      var u = Upwardable({a: five});
      var spy = sinon.spy();
      Object.observe(u, spy); 

      return testGroup(
        "Upwardable as object property",
        [
          test("when value is changed",     _ => five.val = 99),
          test("callback is called",        _ => assert(spy.called))
        ]
      );
    }()

  ]
);
