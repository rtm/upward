// Unit tests for Ass (keepAssigned) module.

import {test, testGroup, assert} from '../src/Tst';
import keepAssigned from '../src/Ass';
import {upwardifyProperties} from '../src/Upw';
import {invert, identity, debugify} from '../src/Fun';
import {propGetter, propValueGetter, valueize} from '../src/Obj';

export default testGroup(
  "module Ass (keepAssigned, #and)",
  [

    function() {
      var a;
      return testGroup(
        "Basic operation",
        [
          test("create keepAssigned",       _ => a = keepAssigned({x: 1})),
          test("result is object",          _ => assert.isObject(a)),
          test("has property",              _ => assert.property(a, 'x')),
          test("with correct value",        _ => assert.equal(valueize(a.x), 1))
        ]
      );
    }(),

    function() {
      var a;
      return testGroup(
        "Combining two objects",
        [
          test("create keepAssigned",       _ => a = keepAssigned({x: 1}, {y: 2})),
          test("has value from second",     _ => assert.equal(valueize(a.y), 2)),
          test("duplicate properties",      _ => a = keepAssigned({x: 1}, {x: 2})),
          test("has value from second",     _ => assert.equal(valueize(a.x), 2))
        ]
      );
    }(),
    
    function() {
      var a;
      return testGroup(
        "Handling simple subojects",
        [
          test("create nexted keepAssigned", _ => a = keepAssigned({x: {x: 1}})),
          test("has correct value",         _ => assert.equal(valueize(a.x.x), 1))
        ]
      );
    }()
  ]
);
