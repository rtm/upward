// String utilities
// ----------------

import {upwardConfig} from './Cfg';

// `my-class` => `myClass`
function camelize(str) {
  return str.replace(
      /[-_]+([a-z])/g,
    (_, letter) => letter.toUpperCase());
}

// `myClass` => `my-class`
function dasherize(str) {
  return str.replace(
      /([a-z])([A-Z])/g,
    (_, let1, let2) => `${let1}-${let2.toLowerCase()}`
  );
}

if (upwardConfig.MODIFY_BUILTIN_PROTOTYPE) {
  String.prototype.camelize =  function() { return camelize (this); };
  String.prototype.dasherize = function() { return dasherize(this); };
}

export {
  camelize,
  dasherize
};
