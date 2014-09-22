/* jshint esnext: true */

var {defineProperty, create, keys, defineProperties} = Object;
var {createTextNode, createElement} = document;

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

var upward = (o, fn) => { console.log('upward', o, fn); o, o.upward && o.upward(fn); };

export function upwardify(fn, changefn = fn) {
	return function(v) {
		console.log("In upwardified fn", fn, changefn, v, v.valueOf());
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
	
export function upwardableTextNode(text) {
	return upwardify(createTextNode.bind(document));
}

var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

Object.assign(HTMLElement.prototype, {
	child: upwardify(chainify(appendChild), replaceChild),
	attr: upwardify(chainify(setAttribute), setAttribute)
});

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
	this.deleteRule(idx);
	return this.insertRule(rule, idx);
};

Node.prototype.toValue = _this;

var obj = createUpwardableObject({ text: document.createTextNode("Hello, world.") });


var DIV = function() {
 	return document.createElement('div');
 };

var button = document.createElement("button");
button.appendChild(document.createTextNode("Press me"));
button.addEventListener('click', function() {console.log(change); change(); });

var component = {
	root: 'app',
	DOM: DIV().child(obj.text).child(button),
	CSS: [],
	listeners: {}
};

var Run = function(app) {
	document.getElementById(app.root).appendChild(app.DOM);
};

Run(component);

export var change = function() {
	console.log("change");
	obj.text=document.createTextNode("Hello, upward world.");
};
