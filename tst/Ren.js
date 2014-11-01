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
    }(),

    function() {
      var e;
      var c = [document.createTextNode('test')];
      return testGroup(
        "basic child handling",
        [
          test("construct elt with child",  _ => e = keepRendered('div', c)),
          test("child is there",            _ => assert.equal(e.childNodes.length, 1)),
          test("delete child",              _ => c.pop()),
          test("child is gone",             _ => assert.equal(e.childNodes.length, 0))
        ]
      );
    }(),

    function() {
      var e;
      var c = [document.createTextNode('test')];
      return testGroup(
        "basic attribute handling",
        [
          test("construct elt with title",  _ => e = keepRendered('div', [], {title: 'test'})),
          test("title is there",            _ => assert.ok(e.hasAttribute('title')))
        ]
      );
    }()

  ]
);
