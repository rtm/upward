// src/Cha.js
//
// Prepare chai-based assertions.

const INSTALL_SHOULD = false;

var {expect, should, assert} = chai;

assign(chai.config, {
  includeStack: true,
  showDiff: true
});

// `should` requires initialization; it pollutes the Object prototype.
if (INSTALL_SHOULD) { should = should(); }


export { assert, should, expect };
