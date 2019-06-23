// UpElement/E
// ===========
// Create HTML elements.

import { Observable } from 'rxjs/Observable';

import { Pair$ } from './types';

import './Evt';
import './Chi';
import './Inp';
import './Att';

/**
 * ## UpElement

 * Create an element.
 * Support low-level sugar in form of `div#id.class`.
 */
export function E(tag: string) {
  var parts = tag.split(/([#.])/);
  tag = parts.shift();
  const elt = document.createElement(tag);

  while (parts.length) {
    let symbol = parts.shift();
    let val    = parts.shift();
    switch (symbol) {
    case '#': elt.id = val;           break;
    case '.': elt.classList.add(val); break;
    }
  }

  return elt;
}

Object.defineProperties(Element.prototype, {
  is: { },
  has: { },
  does: { },
  class(pair$: Pair$) { return ElementClass(this, pair$); },
  data(pair$: Pair$) { return ElementData(this, pair$); },
  style(pair$: Pair$) { return ElementStyle(this, pair$); },

});

declare interface Element {
  is: (pair$: Pair$) => Element,
  has: (pair$: Pair$) => Element,
  does: (pair$: Pair$) => Element,
  style: (pair$: Pair$) => Element,
  class: (pair$: Pair$) => Element,
  attributes: (pair$: Pair$) => Element,
  data: (pair$: Pair$) => Element,
}

export function ElementAttr(elt: HTMLElement, pair$: Pair$) {

  pair$.subscribe(({prop: attrName, value}) => {
    if (value === undefined) elt.removeAttribute(attrName);
    else elt.setAttribute(attrName, value);
  });

  return elt;
}

export function ElementClass(elt: HTMLElement, pair$: Pair$) {
  pair$.subscribe(({prop: cls, value: toggle}) => elt.classList.toggle(cls as string, toggle));

  return elt;
}

export function ElementData(elt: HTMLElement, pair$: Pair$) {
  pair$.subscribe(({prop: dataAttr, value}) => elt.dataset[dataAttr] = value);

  return elt;
}

export function ElementStyle(elt: HTMLElement, pair$: Pair$) {
  pair$.subscribe(({prop: cssAttr, value}) => elt.style[cssAttr as string] = value);

  return elt;
}

export function Att(elt: HTMLElement, atts: Pair$) {

}
