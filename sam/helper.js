function sample(id) {

  function shave(code) {
    return code
      .replace(/^[^]*?\/\/===START\n/, '')
      .replace(/\/\/===END[^]*/, '');
  }

  function setup(dom) {

    function text(response) { return response.text(); }
    function append(text)   { code.appendChild(document.createTextNode(shave(text))); }

    var elt = document.getElementById(id);

    // code block
    var code = document.createElement('div');
    elt.appendChild(code);
    code.className = 'code';
    fetch(id + '.js') . then(text) . then(append);

    // result block
    var result = document.createElement('div');
    elt.appendChild(result);
    result.className = 'result';
    result.appendChild(dom);
  }

  System.import('./'+id).then(
    function(module) { setup(module.default); },
    function(err) {console.log("Cannot import module", id, err); }
  );

}
