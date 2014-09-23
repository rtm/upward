/* jshint esnext: true */

var {defineProperty, create, keys, defineProperties} = Object;
var {createTextNode, createElement} = document;
var {join} = Array;

var valueOf = v => v.valueOf();

function _this() { return this; }

Object.prototype.map = function (fn) {
	return keys(this).reduce((result, k) => (result[k] = fn(this[k], k, this), result), {});
};

//Object.prototype.valueOf = function() {	return this.map(valueOf); };
//RegExp.prototype.valueOf = Date.prototype.valueOf = _this;

var chainify = fn => function() { fn.apply(this, arguments); return this; };

export function Upwardable(v) {
	if (isUpwardable(v)) { return v; }

	var upwards       = [];

	var valueOf       = () => v === null || v === undefined ? v : v.valueOf();
	var set           = nv => { console.log('set', upwards); send_upwards(nv); v = nv; return this; };
	var get           = () => ret;

	var upward        = upward => { console.log('upward', upward); upwards.push(upward); };
	var ununpward     = function() { return this; };
	var send_upwards  = nv => upwards.forEach(fn => fn(nv.valueOf(), v.valueOf()));

	var ret           = {get, set, valueOf, upward};
 
    var onward        = function(f, ...args) {
		function go() {	return f.apply(this.valueOf(), ...args); }
		upward(go);
		return go();
	};
	
	return ret;
};

function upwardablePropertyDescriptor(val) {
	var {get, set} = Upwardable(val);
	return { get, set };
}

function defineUpwardableProperty(obj, prop) {
	var val = obj[prop];
	return isUpwardable(val) ? obj : defineProperty(obj, prop, upwardablePropertyDescriptor(val));
}

export var isUpwardable = x => typeof x === 'object' && x.upward;

var upward = (o, fn) => { console.group('upward'); console.dir(o); console.dir(fn); o.upward && o.upward(fn); console.groupEnd();};

export function upwardify(fn, changefn = fn) {
	return function(v) {
		console.group("In upwardified fn");
		console.dir(fn);
		console.dir(v);
		console.dir(v.valueOf());
		console.groupEnd();
		upward(v, changefn.bind(this));
		return fn.call(this, v.valueOf());
	};
}

export function createUpwardableObject(o) {
	return defineProperties({}, keys(o).reduce((result, k) => {
		result[k] = upwardablePropertyDescriptor(o[k]);
		return result;
	}, {}));
}

/** testing
function upwardArray(a) {
	var w = Upwardable(a);
	a.forEach(elt => upward(elt, () => w.set(Array(a))));
	return w;
}
*/

var joiner = delimiter => function() { return join.call(this, delimiter); };

export var upwardableTextNode = upwardify(
	createTextNode.bind(document),
	function(text) {this.nodeValue = text;}
);

var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

Object.assign(HTMLElement.prototype, {
	child: upwardify(chainify(appendChild), replaceChild),
	attr: upwardify(chainify(setAttribute), setAttribute)
});

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
	this.deleteRule(idx);
	return this.insertRule(rule, idx);
};

var INPUT = function() {
	var input = document.createElement('input');
	input.assign(createUpwardableObject({val: null}));
	input.addEventListener('input', function() { input.val = input.value; });
	return input;
};

Node.prototype.toValue = _this;

var obj = createUpwardableObject({ 
	textnode: document.createTextNode("Hello, world."),
	string: 'fuck'
});


var DIV = function() {
 	return document.createElement('div');
 };

var button = document.createElement("button");
button.appendChild(document.createTextNode("Press me"));

var component = {
	root: 'app',
	DOM: DIV()
//		.child(obj.textnode)
		.child(button)
		.child(upwardableTextNode(obj.string)),
	CSS: [],
	listeners: {}
};

var Run = function(app) {
	document.getElementById(app.root).appendChild(app.DOM);
};

Run(component);

export var change = function() {
	console.log("change");
	obj.textnode=document.createTextNode("Hello, upward world.");
	obj.string = "shit";
};

button.addEventListener('click', change);
