// Upwardable Objects
// ===================

// Upwardable objects are one of the three key components of the upward library,
// along with upwardable values and upwardable functions.
// An **upwardable object** is an enhanced object detects and and acts on
// accesses to its properties, by updating a stream of key/value pair changes.

// An upwardable object is created by calling `U`,
// the default export from this module, on an object.
// `a = Up([1, 2, 3])` or `o=Up({x: 1, y: 2}` create upwardables.
// Newly added properties are also immediately observable.

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/pairs';
import 'rxjs/add/operator/map';

import { Subject } from 'rxjs/Subject';
import { Pair, Pair$ } from './types';

// A system-wide mapping of objects to streams of pairs.
const pairs = new WeakMap<object, Pair$>();

// Create a proxy for an object, so that changes to it emit onto a stream of pairs.
export function U<T extends object>(o: T): T {
  const pair$ = new Subject<Pair>();

  // Remember the stream of pairs for this object to retrieve later.
  pairs.set(o, pair$);

  // Initialize the stream with the current object keys.
  Observable.pairs(o)
    .map((tuple: any) => ({prop: tuple[0], value: tuple[1]}))
    .subscribe(pair$);

  const proxyHandler: ProxyHandler<T> = {
    set(obj: any, prop, value) {
      obj[prop] = value;
      pair$.next({prop, value});
      return true;
    }
  };

  return new Proxy(o, proxyHandler);
}

// Obtain the stream of pairs for some object.
export function getPair$(o: object) {
  return pairs.get(o);
}
