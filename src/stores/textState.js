import { makeAutoObservable } from "mobx";
import CommonState from "./commonState";

class TextState {
	content = "HELLO";

	textStyle = {
		fill: "green",
		fontSize: 50,
		fontFamily: "Arial",
		align: "center",
	};

	constructor(domainStore, content, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
		this.commonState = new CommonState(domainStore, id, trackId);
        this.content = content;
    }

    setTextStyle(textStyle) {
		this.textStyle = {
			...this.textStyle,
			...textStyle,
		};
	}

	setContent(content) {
		this.content = content;
	}
}

export default TextState;
