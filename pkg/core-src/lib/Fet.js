// Utl/Fet.jx
//
// Utilities for fetch.


function fetchJson(...args) {
  return fetch(...args) . then(response => response.json());
}

function fetchText(...args) {
  return fetch(...args) . then(response => response.text());
}

export {
  fetchJson,
  fetchText
};
