import { makeAutoObservable } from "mobx";

import CommonState from "./commonState";

import { randomUUID } from "../../utilities/genericUtilities";

class ImageState {
    source = "";

    constructor(domainStore, source, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, this, "image-" + randomUUID(), trackId);
        this.source = source;
    }
    
    setSource(source) {
        this.source = source;
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
			source: this.source,
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

export default ImageState;
