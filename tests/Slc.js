import keepSliced from '../src/Slc';
import {test, testGroup, expect, should, assert} from '../src/Tst';

export default testGroup(
  "keepSliced",

  function() {
    var a = [1,2,3,4,5,6,7,8,9,10], b;
    return [
      test(
        "does basic slicing", 
        function() {
          b = keepSliced({a, from: 3, to: 7}); // [4, 5, 6, 7]
        },
        function(reporter) {
          reporter.assert("Array length is 4", b.length === 4);
          b.should.have.length(2);
          expect(b.length).to.equal(2);
          assert(lengthOf(b, 2));
          reporter.log(`new array is ${b.join(',')}`);
          reporter.assert("1 === 2", 1 === 2);
        }
      ),
      test(
        "omits removed element from slice",
        function() { a.splice(4,1); },
        function(reporter) { reporter.log(`new array is ${b.join(',')}`); }
      )
    ];
  }()

);
