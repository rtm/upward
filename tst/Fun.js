// Unit tests for Fun module (upwardable functions).

import {test, testGroup} from '../src/Tst';
import {observeObject}   from '../src/Obs';
import C                 from '../src/Fun';

var {observe} = Object;

export default testGroup(
  "module Fun (upwardable functions)",
  [

    function() {
      var c;

      return testGroup(
        "Basic operation",
        [
          test("create computable",         ()         => c = C(_ => void 0)),
          test("result is upwardable",      ({assert}) => assert.ok(C.is(c)))
        ]
      );
    }()
  ]
);
