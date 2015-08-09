// tsts/style.css
// Styling for (HTML) tst reports.

import {testCssRules} from '../src/Tst';
import {UpStyle} from '../src/Up';


UpStyle([
  ["detail",        { marginLeft: '24px'    }],
  ["details > div", { marginLeft: '48px'    }],
  ["body",          { fontFamily: "sans-serif" }]
]);

UpStyle(testCssRules);
