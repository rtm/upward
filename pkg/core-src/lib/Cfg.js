// ### Configuration

// Initialization/setup.
var {assign} = Object;

// Control upward configuration with `LOGGING` and `DEBUG` flags.
var upwardConfig = {
  LOGGING: true,
  DEBUG: true,
  MODIFY_BUILTIN_PROTOTYPES: false,
  TEST: false
};

// Keep a counter which identifies upwardables for debugging purposes.
var id = 0;

function upwardableId() {
  return id++;
}

// Set configuration options.
function configureUpwardable(opts) {
  assign(upwardConfig, opts);
}

function log(...args) {
  if (upwardConfig.LOGGING) {
    console.log('UPWARDIFY:\t', ...args);
  }
}

export {
  upwardConfig,
  configureUpwardable,
  upwardableId,
  log
};
