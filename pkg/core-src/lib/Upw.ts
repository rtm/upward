// Upwardable
// ==========

// The **upwardable** is the key concept in the upward library.
// Upwardables are returned by upwardable functions,
// represent values in upwawrdable objects,
// and have a `change` method to change their values.

// Upwardable Functions
// ====================

// The **upwardable function** is one of the two key components of the upward library,
// along with the **upwardable object**.
// An **upwardable function** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking an upwardable function results in a **upwardable**, which holds the value.
// An upwardable is always an object; if primitive, it is wrapped.

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/pairs';
import 'rxjs/add/observable/of';

import { Pair, Pair$ } from './types';

// import { upwardConfig } from './Cfg';
// import log from './Log';

// const DEBUG_ALL = true;
// const DEBUG = upwardConfig.DEBUG;

// UPW#ARDABLE FUNCTIONS

// Create a function that maps an observable.
export function F<T, R>(project: (value: T, index: number) => R) {
  return function($: Observable<T>): Observable<R> {
    return $.map(project);
  };
}

// UPWARDADABLE OBJECTS

// A system-wide mapping of objects to streams of pairs.
const pairs = new WeakMap<object, Pair$>();

// Create a proxy for an object, so that changes to it emit onto a stream of pairs.
export function O<T extends object>(o: T): T {
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

// Make a single object into an upwardable.
export function U(x: any) {
  return Observable.of(x);
}
