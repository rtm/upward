// Unit tests for src/Fun.js.

import {test, testGroup, skip, expect, should, assert} from '../src/Tst';
import {noop, compose} from '../src/Fun';

export default testGroup(
  "Fun module",
  [
    test("compose", () => {
      var addone = x => x + 1;
      var multiplytwo = x => x * 2;
      assert.equal(compose(addone, multiplytwo)(1), 3);
    })
  ]
);
