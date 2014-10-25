// Unit tests for src/Tst.js.

import {test, testGroup, expect, should, assert} from '../src/Tst';
import {noop} from '../src/Fun';

export default testGroup(
  "Tst module",
  [
    testGroup(
      "Assertion libraries include",
      [
        test("assert", noop, () => assert.isDefined(assert)),
        test("assert (should)", noop, () => should.exist(assert)),
        test("expect", noop, () => should.exist(expect)),
        test("should", noop, () => should.exist(should))
      ]
    ),

    function() {
      return testGroup(
        "should can check equality",
        [
          test("equality", noop, () => "bar".should.equal("bar"))
        ]
      );
    }()
  ]
);
