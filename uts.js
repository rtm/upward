import {computedUpwardable} from 'upward';

var compose = (strings, ...values) => {
  values.push('');
  return [].concat(...strings.map((e, i) => [e, values[i].valueOf()]));
};

var uts      = (strings, ...values) => computedUpwardable(() =>      compose(strings, ...values),  values);
var uts_eval = (strings, ...values) => computedUpwardable(() => eval(compose(strings, ...values)), values);

export {
  uts,          uts as S
  uts_eval
}
