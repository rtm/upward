var {assign, getNotifier, observe} = Object;

var monitorFn = null;

var notifierMap = new WeakMap();

function Monitor(fn, monitorFn) {
	monitor = monitorFn;
	fn();
	monitor = null;
}
	
function Shadow(o) {

	var shadow = {};
  var monitors = {};
	var notifiers = [];
	
	if (o.shadowed) { return o; }

	function shadowKey(k) {
		shadow[k] = o[k];
		monitors[k] = [];

		defineProperty(o, k, {
			get: _ => {
				if (monitorFn) { monitors[k].push(_ => monitorFn(o, k)); }
				return shadow[k];
			},
			set: v => shadow[k] = v
		});
	}

	keys(o).forEach(shadowKey);

	observe(o, recs => recs.forEach(rec => {
		var name = rec.name;
		switch (rec.type) {
		case "add":     shadowKey(name);        break;
    case "update":  shadow[name] = o[name]; break;
    case "delete":  delete shadow[name];    break;
		}
		notifiers.forEach(notifier => notifier.notify(rec));
	}));
	
	defineProperties(o, {
		addNotifier: {
			value: fn => notifiers.push(fn)
		},
		shadowed: {
			value: true
		}
	});

	return o;
	
}

