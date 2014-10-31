// Unit tests for keepSliced.
// ==========================

import keepSliced from '../src/Slc';
import {test, testGroup, expect, should, assert} from '../src/Tst';

var a = [1,2,3,4,5,6,7,8,9,10], b;

export default testGroup(
  "module Slc (keepSliced, Array#of)",
  [
    test("does basic slicing",        _ => b = keepSliced({a, from: 3, to: 7})), // [4, 5, 6, 7]
    test("yields correct length",     _ => assert.lengthOf(b, 4)),
    test("splicing underlying array", _ => a.splice(4,1)),
    test("second element changed",    _ => assert.equal(b[1], 6))
  ]
);
