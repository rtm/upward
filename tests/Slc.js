import keepSliced from '../src/Slc';
import {test, testGroup, expect, should, assert} from '../src/Tst';

export default testGroup(
  "module Slc (keepSliced, Array#of)",

  function() {
    var a = [1,2,3,4,5,6,7,8,9,10], b;
    return [
      test(
        "does basic slicing", 
        _ => b = keepSliced({a, from: 3, to: 7}), // [4, 5, 6, 7]
        _ => b.should.have.length(2)
      ),
      test(
        "omits removed element from slice",
        _ => a.splice(4,1),
        _ => b[1].should.equal(6)
      )
    ];
  }()

);
