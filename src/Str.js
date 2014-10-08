// String utilities
// ----------------

import {upwardConfig} from './Cfg';

// `my-class` => `myClass`
function camelify(str) {
  return str.replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase());
}

// `myClass` => `my-class`
function dasherify(str) {
  return str.replace(/([a-z])([A-Z])/g, (_, let1, let2) => `${let1}-${let2.toLowerCase()}`);
}

if (upwardConfig.MODIFY_BUILTIN_PROTOTYPE) {
	String.prototype.camelify = function() { return camelify(this); };
	String.prototype.dasherify = function() { return dasherify(this); };
}

export {
  camelify,
  dasherify
};
