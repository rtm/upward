// Unit tests for Map (keepMapped) module.

import keepMapped from '../src/Map';
import {test, testGroup, assert} from '../src/Tst';
import {upwardifyProperties} from '../src/Upw';
import {invert, identity, debugify} from '../src/Fun';
import {propGetter, propValueGetter} from '../src/Obj';

export default testGroup(
  "module Map (keepMapped, Array#as)",
  [
    function() {
      var a = [1, 2, 3], b, c;
      return testGroup(
        "Mapped arrays",
        [
          test("mapping array",             _ => b = keepMapped(a)),
          test("should leave it the same",  _ => assert.deepEqual(b, [1, 2, 3])),
          
          test("element changed",           _ => a[0] = 99),
          test("should change in mapped result", _ => assert.deepEqual(b, [99, 2, 3])),
          
          test("element added at end",      _ => a.push(1.5)),
          test("should appear at end",      _ => assert.deepEqual(b, [99, 2, 3, 1.5]))
        ]
      );
    }(),

    function() {
      var a = [1, 2, 3], b, c;
      return testGroup(
        "Changing length",
        [
          test("mapping array",             _ => b = keepMapped(a)),
          test("truncating array",          _ => a.length = 2),
          test("should truncate result",    _ => assert.deepEqual(b, [1, 2]))
        ]
      );
    }(),

    function() {
      var hash = upwardifyProperties({array: [1, 2, 3]})
      var b;
      return testGroup(
        "Upwardly changed array",
        [
          test("sorted upward array",       _ => b = keepMapped(hash.array)),
          test("should be reversed",        _ => assert.deepEqual(b, [1, 2, 3])),
          test("when upward is changed",    _ => hash.array = [4, 5, 6]),
          test("new array should be sorted", _ => assert.deepEqual(b, [4, 5, 6]))
        ]
      );
    }(),

    function() {
      var a = [1, 2, 3];
      var hash = upwardifyProperties({fn: identity})
      var b;
      return testGroup(
        "Upwardly changed function",
        [
          test("after normal mapping",      _ => b = keepMapped(a, hash.fn)),
          test("should be sorted",          _ => assert.deepEqual(b, [1, 2, 3])),
          test("when upwarded fn is changed", _ => hash.fn = x => -x),
          test("array should be resorted",  _ => assert.deepEqual(b, [-1, -2, -3]))
        ]
      );
    }(),
    
    function() {
      var a = [upwardifyProperties({v:1}), upwardifyProperties({v:2}), upwardifyProperties({v:3})];
      var fn = propGetter('v');
      var fn1 = propValueGetter('v');
      var b;
      return testGroup(
        "Upwardly changed values",
        [
          test("after normal mapping",      _ => b = keepMapped(a, fn1)),
          test("should be mapped",          _ => assert.deepEqual(b, [1, 2, 3])),
          test("when value is upwardly changed", _ => a[0].v = 0),
          test("array should be remapped",  _ => assert.deepEqual(b, [0, 2, 3]))
        ]
      );
    }()
  ]
);
