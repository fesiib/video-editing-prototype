import { makeAutoObservable } from "mobx";

import CommonState from "./commonState";

import { randomUUID } from "../../utilities/genericUtilities";

/*

on top of the frame
- Adding Text
- Adding Image
- Adding Shape (rectangle, circle, star)

change the video properties
- Cut/Trim
- Zoom
- Crop
- Blur
(- Adding Frames)
*/

class EditState {
	adjustedVideos = [];
	excludedIds = [];

	textParameters = {
		content: "HELLO", // text input
		style: {
			fill: "#4aa23a", // color picker
			fontSize: 50, // number input & +/- buttons
			fontFamily: "Arial", // dropdown
			align: "center", // 3 align icons
		},
	};

	imageParameters = {
		source: "", // file picker
	};

	shapeParameters = {
		type: "rectangle", // dropdown
	};

	zoomParameters = {};

	blurParameters = {};

	cutParameters = {};

	cropParameters = {
		x: 0, // number input
		y: 0, // number input
		width: 0, // number input
		height: 0, // number input
	};

    constructor(domainStore, intent, title, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, this, "edit-" + randomUUID(), trackId);
		this.intent = intent;
		this.adjustedVideos = [];
		this.excludedIds = [];
		this.title = title;
    }

	getDeepCopy() {
		const newEdit = new EditState(this.domainStore, this.intent, this.title, this.commonState.trackId);
		newEdit.commonState.setMetadata(this.commonState.metadata);
		newEdit.adjustedVideos = [...this.adjustedVideos];
		newEdit.excludedIds = [...this.excludedIds];
		
		newEdit.textParameters = {...this.textParameters};
		newEdit.imageParameters = {...this.imageParameters};
		newEdit.shapeParameters = {...this.shapeParameters};
		
		newEdit.zoomParameters = {...this.zoomParameters};
		newEdit.cropParameters = {...this.cropParameters};

		newEdit.cutParameters = {...this.cutParameters};
		newEdit.blurParameters = {...this.blurParameters};
		// add all parameters
		return newEdit;
	}

	setCustomParameters(parameters) {
		if (this.intent.editOperation === null) {
			return;
		}
		if (this.intent.editOperation.title === "Text") {
			this.textParameters = { 
				...this.textParameters,
				...parameters,
				style: {
					...this.textParameters.style,
					...parameters.style,
				}
			};
		}
		if (this.intent.editOperation.title === "Image") {
			this.imageParameters = {
				...this.imageParameters,
				...parameters
			};
		}
		if (this.intent.editOperation.title === "Shape") {
			this.shapeParameters = {
				...this.shapeParameters,
				...parameters
			};
		}
		if (this.intent.editOperation.title === "Zoom") {
			this.zoomParameters = {
				...this.zoomParameters,
				...parameters
			};
		}
		if (this.intent.editOperation.title === "Crop") {
			this.cropParameters = {
				...this.cropParameters,
				...parameters
			};
		}
		if (this.intent.editOperation.title === "Cut") {
			this.cutParameters = {
				...this.cutParameters,
				...parameters
			};
		}
		if (this.intent.editOperation.title === "Blur") {
			this.blurParameters = {
				...this.blurParameters,
				...parameters
			};
		}
	}

	setSpatialParameters(parameters) {
		this.commonState.setMetadata({ ...parameters });
	}

	setTemporalParameters(parameters) {
		if (parameters.start !== undefined) {
			this.commonState.setMetadata({
				offset: parameters.start,
				start: parameters.start,
			});
		}
		if (parameters.finish !== undefined) {
			this.commonState.setMetadata({
				finish: parameters.finish - this.commonState.offset + this.commonState.start,
			});
		}
		if (parameters.duration !== undefined) {
			this.commonState.setMetadata({
				finish: this.commonState.start + parameters.duration,
			});
		}
		if (parameters.speed !== undefined) {
			this.commonState.setMetadata({
				speed: parameters.speed,
			});
		}
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
			start: this.commonState.offset,
			finish: this.commonState.end,
			duration: this.commonState.sceneDuration,
			speed: this.commonState.speed,
		};
	}

	get customParameters() {
		if (this.intent.editOperation === null) {
			return {};
		}
		if (this.intent.editOperation.title === "Text") {
			return this.textParameters;
		}
		if (this.intent.editOperation.title === "Image") {
			return this.imageParameters;
		}
		if (this.intent.editOperation.title === "Shape") {
			return this.shapeParameters;
		}

		if (this.intent.editOperation.title === "Zoom") {
			return this.zoomParameters;
		}
		if (this.intent.editOperation.title === "Crop") {
			return this.cropParameters;
		}

		if (this.intent.editOperation.title === "Cut") {
			return this.cutParameters;
		}
		if (this.intent.editOperation.title === "Blur") {
			return this.blurParameters;
		}
		return null;
	}

	get metaParameters() {
		if (this.intent.editOperation === null) {
			return {};
		}
		if (this.intent.editOperation.title === "Cut"
			|| this.intent.editOperation.title === "Blur"
		) {
			return {
				spatial: null,
				temporal: this.temporalParameters,
				custom: this.customParameters,
			}
		}
		return {
			spatial: this.spatialParameters,
			temporal: this.temporalParameters,
			custom: this.customParameters,
		};
	}
}

export default EditState;
