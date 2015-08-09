// src/Fad.js
//
// Implement fading or other effects when specified DOM element changes.
// Requres MutationObserver (not available in IE <= 10).
// In its absence, does nothing.
//
// To select specific effects in addition to the default fading, supply additional effects:
// ```
// FADE(elt, ['flipVertical'])
// ```
//


import UpStyle, {transform} from './Css';
import E from './Elt';
import U from './Upw';


const NO_MUTATION_OBSERVER = typeof MutationObserver === 'undefined';
const MUTATION_CONFIG = { childList: true, characterData: true, subtree: true, attributes: true };
const EFFECTS = ['flipVertical', 'flipHorizontal', 'rotateRight', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'zoom'];


export default function(elt, effect) {

  // Start (in) and stop (out) transition.
  function start() {
    classes.isTransition = true;
    original.addEventListener('transitionend', end);
  }

  function end() {
    fader.replaceChild(original.cloneNode(true), original.nextSibling);
    classes.isTransition = false;
    original.removeEventListener('transitionend', end);
  }

  if (NO_MUTATION_OBSERVER) return;

  var classes = U({
    FadeElement:         true,
    'FadeElement--fade': true,
    isTransition:        false,
    isDisabled:          NO_MUTATION_OBSERVER
  });
  if (effect) classes['FadeElement--' + effect] = true;

  var original = E('div') . has(elt);
  var fader    = E('div') . is({class: classes}) . has([original, E('div')]);

  end();
  new MutationObserver(start).observe(original, MUTATION_CONFIG);

  return fader;
}


// #### STYLES
// The `FadeElement` element has two children. First is original, second is clone.
//
// To control duration, set the `transition-duration` property on the `FadeElement` component.
// `transition-timing-function` and `transform-origin` may be similarly set.

var cssRules = [

  ['.Fade-element', {
    /* Make this an offset parent, so the absolute positioning of the clone is relative to it. */
    position: 'relative',         /* create formatting context for absolutely-positioned clone */

    /* Set transition properties, to be inherited by children. */
    transitionDuration:       '800ms',                        /* override this to change duration */
    transitionTimingFunction: 'cubic-bezier(0, 1.2, 1, 1.2)', /* little bounce at top */

    overflow: 'hidden'
  }],

  /* We want to transition only going in, not coming out. */
  ['.Fade-element.is-transition > *', { transitionProperty: 'all' }],

  /* CHILD ELEMENTS (original and clone) */

  /* The second child is the clone. Place it directly over the original version. */
  ['.Fade-element > :nth-child(2)', { position: 'absolute', top: 0, left: 0 }],

  ['.Fade-element > *', {
    /* By default, no transition, unless `is-transition` is present; see next rule. */
    transitionProperty:       'none',

    /* Inherit properties set on main element. */
    transitionDuration:       'inherit',
    transitionTimingFunction: 'inherit',
    transformOrigin:          'inherit',

    backfaceVisibility:       'hidden',

    display:                  'inline-block'
  }],


  // EFFECTS

  ['.Fade-element--fade                          > :nth-child(1)', { opacity: 0 }],
  ['.Fade-element--fade                          > :nth-child(2)', { opacity: 1 }],
  ['.Fade-element--fade.is-transition            > :nth-child(1)', { opacity: 1 }],
  ['.Fade-element--fade.is-transition            > :nth-child(2)', { opacity: 0 }],

  ['.Fade-element--slide-right                   > :nth-child(1)', { transform: transform.translateX('-100%') }],
  ['.Fade-element--slide-right                   > :nth-child(2)', { transform: transform.translateX(0)       }],
  ['.Fade-element--slide-right.is-transition     > :nth-child(1)', { transform: transform.translateX(0)       }],
  ['.Fade-element--slide-right.is-transition     > :nth-child(2)', { transform: transform.translateX('+100%') }],

  ['.Fade-element--slide-left                    > :nth-child(1)', { transform: transform.translateX('+100%') }],
  ['.Fade-element--slide-left                    > :nth-child(2)', { transform: transform.translateX(0)       }],
  ['.Fade-element--slide-left.is-transition      > :nth-child(1)', { transform: transform.translateX(0)       }],
  ['.Fade-element--slide-left.is-transition      > :nth-child(2)', { transform: transform.translateX('-100%') }],

  ['.Fade-element--slideDown                     > :nth-child(1)', { transform: transform.translateY('-100%') }],
  ['.Fade-element--slideDown                     > :nth-child(2)', { transform: transform.translateY(0)       }],
  ['.Fade-element--slideDown.is-transition       > :nth-child(1)', { transform: transform.translateY(0)       }],
  ['.Fade-element--slideDown.is-transition       > :nth-child(2)', { transform: transform.translateY('+100%') }],

  ['.Fade-element--slideUp                       > :nth-child(1)', { transform: transform.translateY('+100%') }],
  ['.Fade-element--slideUp                       > :nth-child(2)', { transform: transform.translateY(0)       }],
  ['.Fade-element--slideUp.is-transition         > :nth-child(1)', { transform: transform.translateY(0)       }],
  ['.Fade-element--slideUp.is-transition         > :nth-child(2)', { transform: transform.translateY('-100%') }],

  ['.Fade-element--rotateRight                   > :nth-child(1)', { transform: transform.rotate(0)           }],
  ['.Fade-element--rotateRight                   > :nth-child(2)', { transform: transform.rotate(0)           }],
  ['.Fade-element--rotateRight.is-transition     > :nth-child(1)', { transform: transform.rotate('360deg')    }],
  ['.Fade-element--rotateRight.is-transition     > :nth-child(2)', { transform: transform.rotate('360deg')    }],

  ['.Fade-element--flip-vertical                 > :nth-child(1)', { transform: transform.rotateX(0)          }],
  ['.Fade-element--flip-vertical                 > :nth-child(2)', { transform: transform.rotateX(0)          }],
  ['.Fade-element--flip-vertical.is-transition   > :nth-child(1)', { transform: transform.rotateX('360deg')   }],
  ['.Fade-element--flip-vertical.is-transition   > :nth-child(2)', { transform: transform.rotateX('360deg')   }],

  ['.Fade-element--flip-horizontal               > :nth-child(1)', { transform: transform.rotateY(0)          }],
  ['.Fade-element--flip-horizontal               > :nth-child(2)', { transform: transform.rotateY(0)          }],
  ['.Fade-element--flip-horizontal.is-transition > :nth-child(1)', { transform: transform.rotateY('360deg')   }],
  ['.Fade-element--flip-horizontal.is-transition > :nth-child(2)', { transform: transform.rotateY('360deg')   }],

  ['.Fade-element--zoom               > :nth-child(1)', { transform: transform.scale(1.5) }],
  ['.Fade-element--zoom               > :nth-child(2)', { transform: transform.scale(1.0) }],
  ['.Fade-element--zoom.is-transition > :nth-child(1)', { transform: transform.scale(1.0) }],
  ['.Fade-element--zoom.is-transition > :nth-child(2)', { transform: transform.scale(1.5) }],

  /* If component is turned off (MutationObserver not available?), just show the original. */
  ['.Fade-element.is-disabled  > :nth-child(1)', { opacity: 1, transform: transform.translate(0, 0) }]
];

UpStyle(cssRules);
