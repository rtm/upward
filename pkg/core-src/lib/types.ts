import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/pairs';

export interface Pair {
  prop: PropertyKey;
  value: any;
  oldValue?: any;
}

// OBSERVABLE TYPES
export type String$  = Observable<string>;
export type Number$  = Observable<number>;
export type Boolean$ = Observable<boolean>;
export type Any$     = Observable<any>;
export type Pair$ = Observable<Pair>;
