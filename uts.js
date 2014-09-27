import {computedUpwardable} from 'upward';

var compose = (strings, ...values) => 
  strings.reduce(
    (result, string, i) => result += string + (i < values.length ? values[i].valueOf() : ""),
    ""
  )
;

var uts = (strings, ...values) => 
  computedUpwardable(
    () => compose(strings, ...values), 
    values
  )
;

var uts_eval = (strings, ...values) =>
  computedUpwardable(
    () => eval(compose(strings, ...values)),
    values
  )
;


export {
  uts,
  uts_eval
}
