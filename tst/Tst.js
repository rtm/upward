// Unit tests for src/Tst.js.

import {test, testGroup, skip, assert} from '../src/Tst';
import {noop} from '../src/Fun';

export default testGroup(
  "module Tst",
  [
    testGroup(
      "Assertion libraries include",
      [
        test("assert"     ,            _ => assert.isDefined(assert)),
        test("expect",                 _ => assert.isDefined(expect)),
        test("should",                 _ => assert.isDefined(should))
      ]
    ),

    testGroup(
      "various assertion library checks",
      [
        test("equality",               _ => assert.equal("bar", "bar")),
        test("throwing",               _ => assert.throws(_ => { throw "fuck"; }))
      ]
    )
  ]
);
