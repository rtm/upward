// Local storage
// =============

/**
 * ## LocalStorage
 *
 * Create object with `get` and `put` methods to interface with local storage.
 *
 * @param {String} id ID to use for local storage
 */

export default function LocalStorage(id) {
  return {
    get() { return JSON.parse(localStorage.getItem(id) || '[]'); },
    put() { localStorage.setItem(id, JSON.stringify(objects)); }
  };
}
