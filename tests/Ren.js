// Unit tests for keepRendered.
// ============================

import keepRendered from '../src/Ren';
import {test, testGroup, assert} from '../src/Tst';

export default testGroup(
  "module Ren (keepRendered (R))",
  [
    function() {
      var e;
      return testGroup(
        "basic element creation",
        [
          test("construct empty element",   _ => e = keepRendered('div')),
          test("is HTMLElement",            _ => assert.instanceOf(e, HTMLElement)),
          test("with correct tag name",     _ => assert.equal(e.tagName, 'DIV'))
        ]
      );
    }()
  ]
);
