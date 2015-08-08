// sam/main.js
//
// Main file for upward samples.

import './style';

import cntSample from './Cnt';
import tmpSample from './Tem';
import funSample from './Fun';
import butSample from './But';

import markdown from '../node_modules/markdown/lib/markdown';

var samples = [
  { sample: cntSample, js: 'Cnt' },
//  { sample: tmpSample, js: 'Tmp' },
//  { sample: funSample, js: 'Fun' },
//  { sample: butSample, js: 'But' }
];

var div = document.getElementById('samples');

// Retrieve the section of code between ===START and ===END.
function getCode(js) {
  return js .
    replace(/^[^]*?\/\/===START\n/, '') .
    replace(/\/\/===END[^]*/, '');
}

function getDescription(js) {
  return js .
    match(/^\/\/\/(.*)$/m) .
    join();
}


// Insert a single sample.
function oneSample(sample) {

  function text(response) { return response.text(); }
  function append(text)   { code.appendChild(document.createTextNode(getCode(text))); }

  var section = document.createElement('section');

  // code block
  var code = document.createElement('div');
  code.className = 'code';
  section.appendChild(code);
  fetch(sample.js + '.js') . then(text) . then(append);

  // result block
  var result = document.createElement('div');
  result.className = 'result';
  section.appendChild(result);
  result.appendChild(sample.sample);

  // description block
  var description = document.createElement('div');
  description.className = 'desc';
  section.appendChild(description);
  description.innerHTML = markdown.toHTML(getDescription(code);

  // Put this sample in the HTML.
  div.appendChild(section);
}

function go() {
  samples.forEach(oneSample);
}


go();
