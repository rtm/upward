// Unit tests for Srt (keepSorted) module.

import keepSorted from '../src/Srt';
import {test, testGroup, assert} from '../src/Tst';
import {upwardifyProperties} from '../src/Upw';

export default testGroup(
  "module Srt (keepSorted, Array#by)",
  [
    function() {
      var a = [3, 2, 1], b, c;
      return testGroup(
        "Sorted arrays",
        [
          test("sorting array",             _ => b = keepSorted(a)),
          test("should reverse it",         _ => assert.deepEqual(b, [1, 2, 3])),
          
          test("element changed",           _ => a[0] = 99),
          test("should change in sorted result", _ => assert.deepEqual(b, [1, 2, 99])),
          
          test("element added at end",      _ => a.push(1.5)),
          test("should come to front",      _ => assert.deepEqual(b, [1, 1.5, 2, 99]))
        ]
      );
    }(),

    function() {
      var a = [3, 2, 1], b, c;
      return testGroup(
        "Changing length",
        [
          test("sorting array",             _ => b = keepSorted(a)),
          test("truncating array",          _ => a.length = 2),
          test("should truncate result",    _ => assert.deepEqual(b, [2, 3]))
        ]
      );
    }(),

    function() {
      var hash = upwardifyProperties({array: [3, 2, 1]})
      var b;
      return testGroup(
        "Upwardly changed array",
        [
          test("sorted upward array",       _ => b = keepSorted(hash.array)),
          test("should be reversed",        _ => assert.deepEqual(b, [1, 2, 3])),
          test("when upward is changed",    _ => hash.array = [6, 5, 4]),
          test("new array should be sorted", _ => assert.deepEqual(b, [4, 5, 6]))
        ]
      );
    }()
  ]
);
