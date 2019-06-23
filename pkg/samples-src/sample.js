import {P, DIV, BUTTON, TEXT, SPAN, V} from 'upward/src/U';

export default {

	description: DIV()
		.elements(
			[
				H3("Managing classes on elements"),
				P(`Classes are specified by hashes, with camelized names as keys and boolean values.
					This makes it easy to turn classes on and off.`)
			]),

	code: function() {
		var model = P({hide: true});
		return dom = DIV()
			.classes({fuck: true})
			.child(
				SPAN()
					.child(TEXT("I am some text"))
					.classes({hide: model.hide})
			)
			.child(BUTTON("Click me", () => {console.log("pressed"); model.hide = !V(model.hide); }));
	}
};
