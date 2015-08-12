// Unit tests for src/Ify.js.

import {test, testGroup, skip} from '../src/Tst';
import {noop, compose, swapify, argify, invertify, dropify} from '../src/Ify';

export default testGroup(
  "module Ify (functional programming)",
  [

    test("compose", ({assert}) => {
      var addone = x => x + 1;
      var multiplytwo = x => x * 2;
      assert.equal(compose(addone, multiplytwo)(1), 3);
    }),

    test("swapify", ({assert}) => {
      var callback = sinon.spy();
      var proxy = swapify(callback);
      proxy(1, 2);
      assert(callback.calledWith(2, 1));
    }),

    test("argify", ({assert}) => {
      var callback = sinon.spy();
      var proxy = argify(callback, 1);
      proxy(2);
      assert(callback.calledWith(1, 2));
    }),

    test("invertify", ({assert}) => {
      var callback = sinon.stub().returns(true);
      var proxy = invertify(callback);
      assert(!proxy());
    }),

    test("dropify", ({assert}) => {
      var callback = sinon.spy();
      var proxy = dropify(callback);
      proxy(1, 2);
      assert(callback.calledWith(2));
    }),

    test("recursify", ({assert}) => {
      function factorial(self) {
        return n => n > 1 ? self(n-1) : 1;
      }

      assert.equal(recursify(factorial)(6), 720);
    }),


    // maybeify
    // selfify
    // repeatify
    // oneceify
    // wrapify

  ]
);
