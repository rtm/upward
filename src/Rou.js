// Routing
// =======

import C from './Com';
import U from './Obj';
import {parseUrlSearch} from './Utl';
import {copyOntoObject} from './Out';

var {keys} = Object;

var urlData = U({ protocol: '', host: '', hash: '', pathname: '', segs: [], hash: '', search: {} });

function popstate() {
  urlData.protocol = window.location.protocol;
  urlData.host     = window.location.host;
  urlData.hash     = window.location.hash;
  urlData.pathname = window.location.pathname;

  parseSearch(window.location.search);

  urlData.segs     = window.location.pathname.split('/');
}


function parseSearch(search) {
  copyOntoObject(urlData.search, parseUrlSearch(search));
}

window.addEventListener('popstate', popstate);

var route = C(function route(segs, handlers) {
  segs = segs.slice();
  var seg = segs.shift();

  return handlers[seg](segs);
});

function push(url) {
  window.pushState(stateObj, "", url);
}

function replace(url) {
  window.replaceState(stateObj, "", url);
}

function router(handlers) {
  return route(urlData.segs, handlers);
}


export {
  router,
  route,
  push,
  replace,
  urlData
};
