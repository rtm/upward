// Unit tests for src/Fun.js.

import {test, testGroup, skip, expect, should, assert} from '../src/Tst';
import {noop, compose, swapify, argify, invertify} from '../src/Fun';

export default testGroup(
  "Fun module",
  [

    test("compose", () => {
      var addone = x => x + 1;
      var multiplytwo = x => x * 2;
      assert.equal(compose(addone, multiplytwo)(1), 3);
    }),

    test("swapify", _ => {
      var callback = sinon.spy();
      var proxy = swapify(callback);
      proxy(1, 2);
      assert(callback.calledWith(2, 1));
    }),

    test("argify", _ => {
      var callback = sinon.spy();
      var proxy = argify(callback, 1);
      proxy(2);
      assert(callback.calledWith(1, 2));
    }),

    test("invertify", _ => {
      var callback = sinon.stub().returns(true);
      var proxy = invertify(callback);
      assert(!proxy());
    })

  ]
);
