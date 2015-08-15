var fs = require('fs');

var file = process.argv[2];
var root = process.argv[3];

var files = fs.readFileSync(file, { encoding: 'utf8' });
files = files.split(/\s+/).filter(Boolean).map(function(file) { return file.replace(root, ''); });

process.stdout.write(JSON.stringify([
  "trigger",
  root,
  {
    name: "tst",
    append_files: false,
    command: ["make"],
    chdir: "tst",
    //expression: ["match", files.join('|')]
//    expression: ["match", "tst\\/src\\/Ify.js"]
    expression: ["anyof"] . concat(files.map(function(file) {
      return ["match", file, "wholename"];
    }))
  }
]));
