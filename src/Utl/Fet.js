// Utl/Fet.jx
//
// Utilities for fetch.

function fetchJson(...args) {
  return fetch(...args) . then(response => response.json());
}

export {
  fetchJson
};
