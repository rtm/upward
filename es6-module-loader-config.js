// es6-module-loader-config.js
//
// Set up ES6 module loader.
// Include this script into HTML after including es6-module-loader.

System.transpiler = 'babel';

// Patch locate hook to Append '.js' filetype.
var systemLocate = System.locate;
System.locate = function(load) {
  var System = this; // its good to ensure exact instance-binding
  return Promise.resolve(systemLocate.call(this, load)).then(function(address) {
    return address + '.js';
  });
}
