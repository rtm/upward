import {P, DIV, BUTTON, TEXT, SPAN, V} from 'upward/src/U';

var model = P({hide: true});
var dom = DIV()
	.classes({fuck: true})
	.child(
		SPAN()
			.child(TEXT("I am some text"))
			.classes({hide: model.hide})
	)
	.child(BUTTON("Click me", () => {console.log("pressed"); model.hide = !V(model.hide); }));

export default dom;
