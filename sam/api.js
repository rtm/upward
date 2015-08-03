import {U, T, C, F} from '../src/Up';
import {fetchJson} from '../src/Utl/Fet';

var get, dom, data;

//===START
data = U({repo: 'rtm/upward'});

function url(repo)  { return `https://api.github.com/repos/${repo}/events`; }
function type(json) { return json[0].type; }

get = C(function(repo) { return fetchJson(url(repo)) . then(type); });

dom = T(F`Most recent event was ${get(data.repo)}`);
//===END

export default dom;
