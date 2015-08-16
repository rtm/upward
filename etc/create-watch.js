// etc/create-watch.js
//
// Create JSON to drive watchman.
// Usage:
// ```
// node create-watch.js filelist watchroot triggername
// ```

var fs = require('fs');

var file = process.argv[2];
var root = process.argv[3];
var trigger = process.argv[4];
var chdir = process.argv[5];

if (root[root.length-1] !== '/') root += '/';

var files = fs.readFileSync(file, { encoding: 'utf8' });
files = files.split(/\s+/).filter(Boolean).map(function(file) { return file.replace(root, ''); });

process.stdout.write(JSON.stringify([
  "trigger",
  root,
  {
    name: trigger,
    append_files: false,
    command: ["make"],
    chdir: chdir,
    expression: ["anyof"] . concat(files.map(function(file) {
      return ["match", file, "wholename"];
    }))
  }
]));
