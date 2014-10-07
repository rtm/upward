function sample(id, dom) {
	var elt = document.getElementById(id);

	// code block
	var xhr = new XMLHttpRequest;
	xhr.open('GET', id+'.js', false);
  xhr.send(null);

  var code = document.createElement('div');
	elt.appendChild(code);
	code.className = 'code';
	code.appendChild(document.createTextNode(xhr.responseText));


	// result block
	var result = document.createElement('div');
	elt.appendChild(result);
	result.className = 'result';
	result.appendChild(dom);
}
