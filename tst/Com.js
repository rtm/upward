// Unit tests for Com (Computable) module.

import {test, testGroup, assert} from '../src/Tst';
import {observeObject} from '../src/Obs';
import C from '../src/Com';

var {observe} = Object;

export default testGroup(
  "module Com (computables)",
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

