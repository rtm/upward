// tst/src/style.css
// Styling for (HTML) tst reports.

import {UpStyle} from '..';
import {testCssRules} from '../../src/Tst';

UpStyle([
  ["detail",        { marginLeft: '24px'    }],
  ["details > div", { marginLeft: '48px'    }],
  ["body",          { fontFamily: "sans-serif" }]
]);

UpStyle(testCssRules);
