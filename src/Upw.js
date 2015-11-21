// Add ids and debug flag to upwardables.
var id = 0;

function adorn(u, debug = false) {
  if (upwardConfig.DEBUG) {
    defineProperties(u, {
      _upwardableId: { value: id++ },
      _upwardableDebug: { value: debug }
    });
  }
}
