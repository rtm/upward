// Upward-aware utilities
// ======================

import C from './Upf';

var equals = C(function(v1, v2)  { return v1 == v2; });
var not    = C(function(v1)      { return !v1.valueOf(); });
var choose = C(function(x, y, z) { return x == true ? y : z; });

export {equals, not, choose};
