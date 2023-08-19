import { makeAutoObservable } from "mobx";

import CommonState from "./commonState";

import { randomUUID } from "../../utilities/genericUtilities";

class TextState {
    content = "HELLO";

    textStyle = {
        fill: "green",
        fontSize: 50,
        fontFamily: "Arial",
        align: "center",
    };

    constructor(domainStore, content, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, this, "text-" + randomUUID(), trackId);
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

	get spatialParameters() {
		return {
			x: this.commonState.x,
			y: this.commonState.y,
			z: this.commonState.z,
			width: this.commonState.width,
			height: this.commonState.height,
			scaleX: this.commonState.scaleX,
			scaleY: this.commonState.scaleY,
			rotation: this.commonState.rotation,
		}
	}

	get temporalParameters() {
		return {
			start: this.commonState.start,
			finish: this.commonState.finish,
			duration: this.commonState.duration,
			offset: this.commonState.offset,
			speed: this.commonState.speed,
		};
	}

	get customParameters() {
		return {
			content: this.content,
			color: this.textStyle.fill,
			fontSize: this.textStyle.fontSize,
			fontFamily: this.textStyle.fontFamily,
			align: this.textStyle.align,
		};
	}

	get metaParameters() {
		return {
			spatial: this.spatialParameters,
			temporal: this.temporalParameters,
			custom: this.customParameters,
		};
	}
}

export default TextState;
