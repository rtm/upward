// Unit tests for Upw module.

import {test, testGroup, assert} from '../src/Tst';
import {U} from '..';
import {invert, identity, debugify} from '../src/Ify';
import {propGetter, propValueGetter, valueize} from '../src/Out';
import {observeObject} from '../src/Obs';

var {observe} = Object;

export default testGroup(
  "module Upw (upwardables)",
  [

    function() {
      var a;
      var b = [1, 2, 3];
      var spy = sinon.spy();
      return testGroup(
        "Upwardable arrays",
        [
          test("create upwardable array",   _ => a = U(b)),
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
          test("create upwardable object",  _ => u = U(b)),
          test("when value is changed",     _ => { Object.observe(u, spy); b.x = 2; }),
          test("callback is called",        _ => assert(spy.called))
        ]
      );
    }()

  ]
);
