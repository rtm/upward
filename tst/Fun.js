// Unit tests for Fun module.

import {test, testGroup, assert} from '../src/Tst';
import {observeObject} from '../src/Obs';
import C from '../src/Fun';

var {observe} = Object;

export default testGroup(
  "module Fun (upwardable functions)",
  [

    function() {
      var c;

      return testGroup(
        "Basic operation",
        [
          test("create computable",         _ => c = C(_ => void 0)),
          test("result is upwardable",      _ => assert.ok(C.is(c)))
        ]
      );
    }()
  ]
);
