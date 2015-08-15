// Unit tests for Fun module (upwardable functions).

import {C, test, testGroup} from '..';

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
