// Unit tests for src/Tst.js.

import {test, testGroup, expect, should, assert} from '../src/Tst';
import {noop} from '../src/Fun';

export default testGroup(
  "Tst module",
  [
    testGroup(
      "Assertion libraries include",
      [
        test("assert", () => assert.isDefined(assert)).skip(),
        test("assert (should)", () => should.exist(assert)),
        test("expect", () => should.exist(expect)),
        test("should", () => should.exist(should))
      ]
    ),

    function() {
      return testGroup(
        "various assertion library checks",
        [
          test("equality", () => "bar".should.equal("bar")),
          test("Throw", () => should.Throw(_ => { throw "fuck" }))
        ]
      );
    }()
  ]
);
