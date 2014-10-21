// Keep an array sliced as it changes.
export default function keepSliced(a, from, to) {
  var result = [];

  function doit() {
    for (i = from; i < to; i++) {
      result[i - from] = a[i];
    }
    
  }
}

