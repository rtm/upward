// sam/main.js
//
// Main file for upward samples.

import markdown from '../node_modules/markdown/lib/markdown';


import './style';

import cntSample from './Cnt';
import tmpSample from './Tem';
import funSample from './Fun';
import butSample from './But';
import apiSample from './Api';
import mapSample from './Map';
import srtSample from './Srt';
import cssSample from './Css';
import fadSample from './Fad';

var samples = [
  { sample: cntSample, js: 'Cnt' },
  { sample: tmpSample, js: 'Tem' },
  { sample: funSample, js: 'Fun' },
  { sample: butSample, js: 'But' },
  { sample: apiSample, js: 'Api' },
  { sample: mapSample, js: 'Map' },
  { sample: srtSample, js: 'Srt' },
  { sample: cssSample, js: 'Css' },
  { sample: fadSample, js: 'Fad' },
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
    match(/^\/\/\/(.*)$/gm) .
    map(line => line.replace(/^\/\/\/\s*/, '')) .
    join('\n');
}


// Insert a single sample.
function oneSample(sample) {

  function text(response) { return response.text(); }
  function append(text)   { code.appendChild(document.createTextNode(getCode(text))); }

  var section = document.createElement('section');
  section.id = sample.js;
  var js = fetch(sample.js + '.js') . then(text);

  // description block
  var description = document.createElement('div');
  description.className = 'desc';
  section.appendChild(description);
  js.then(text => description.innerHTML = markdown.toHTML(getDescription(text)));

  // code block
  var code = document.createElement('div');
  code.className = 'code';
  section.appendChild(code);
  js.then(append);

  // result block
  var result = document.createElement('div');
  result.className = 'result';
  section.appendChild(result);
  result.appendChild(sample.sample);

  // Put this sample in the HTML.
  div.appendChild(section);
}

function go() {
  samples.forEach(oneSample);
}


go();
