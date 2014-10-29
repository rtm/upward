// Unit tests for src/Tst.js.

import {test, testGroup, skip, expect, should, assert} from '../src/Tst';
import {noop} from '../src/Fun';

export default testGroup(
  "module Tst",
  [
    testGroup(
      "Assertion libraries include",
      [
        skip(test("assert", () => assert.isDefined(assert))),
        test("assert (should)", () => should.exist(assert)),
        test("expect", () => should.exist(expect)),
        test("should", () => should.exist(should))
      ]
    ),

    testGroup(
      "various assertion library checks",
      [
        test("equality", () => "bar".should.equal("bar")),
        test("Throw", () => should.Throw(_ => { throw "fuck" }))
      ]
    )
  ]
);
