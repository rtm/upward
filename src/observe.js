var {assign, getNotifier, observe} = Object;

function Observe(o) {

	observe(o, recs => {
		if (isUpwardifiedObject(o)) {
			recs.forEach(rec => {
				var name = rec.name;
				switch (rec.type) {
				case "add":     upwardifyProperty(o, name); break;
				case "update":  shadow[name] = o[name]; break;
				case "delete":  delete shadow[name];    break;
				}
				notifiers.forEach(notifier => notifier.notify(rec));
			}));
	
	return o;
	
}

