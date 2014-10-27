// Unit tests for Rev (keepReversed) module.

import keepReversed from '../src/Rev';
import {test, testGroup, assert} from '../src/Tst';
import {upwardifyProperties} from '../src/Upw';

export default testGroup(
  "module Rev (keepSliced, Array#up)",
  [
    function() {
      var a = [1,2,3], b, c;
      return testGroup(
        "Reversed arrays",
        [
          test("reversing array",           _ => b = keepReversed(a)),
          test("should reverse it",         _ => assert.deepEqual(b, [3, 2, 1])),
          
          test("element changed",           _ => a[0] = 99),
          test("should change in reversed location", _ => assert.deepEqual(b, [3, 2, 99])),
          
          test("element added at end",      _ => a.push(6)),
          test("should come to front",      _ => assert.propertyVal(b, 0, 6))
        ]
      );
    }(),

    function () {
      var a = [1, 2, 3], b;
      return testGroup(
        "Non-reversed arrays",
        [
          test("non-reversing array",       _ => b = keepReversed(a, true)),
          test("should not be reversed",    _ => assert.deepEqual(a, b))
        ]
      );
    }(),

    function() {
      var hash = upwardifyProperties({array: [1, 2, 3]})
      var b;
      return testGroup(
        "Upwardly changed array",
        [
          test("reversed upward array",     _ => b = keepReversed(hash.array)),
          test("should be reversed",        _ => assert.deepEqual(b, [3, 2, 1])),
          test("when upward is changed",    _ => hash.array = [4, 5, 6]),
          test("new array should be reversed", _ => assert.deepEqual(b, [6, 5, 4]))
        ]
      );
    }(),
    
    function() {
      var a = [1, 2, 3];
      var hash = upwardifyProperties({order: false})
      var b;
      return testGroup(
        "Upwardly changed order",
        [
          test("reversed array",            _ => b = keepReversed(a, hash.order)),
          test("should be reversed",        _ => assert.deepEqual(b, [3, 2, 1])),
          test("when order is changed",     _ => hash.order = true),
          test("array should revert",       _ => assert.deepEqual(b, [1, 2, 3]))
        ]
      );
    }()
  ]
);
