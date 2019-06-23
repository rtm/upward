import {U, T, C, F} from 'upward';
import {fetchJson} from 'upward/src/Fet';

var get, dom, data;

/// ### API calls
///
/// Upwardable functions can return asynchronous data, such as the result of API calls.
/// Here we display the most recent event from a Github repository.

//===START
data = U({repo: 'rtm/upward'});

function url(repo)  { return `https://api.github.com/repos/${repo}/events`; }
function type(json) { return json[0].type; }

get = C(function(repo) { return fetchJson(url(repo)) . then(type); });

dom = T(F`Most recent event was ${get(data.repo)}`);
//===END

export default dom;
