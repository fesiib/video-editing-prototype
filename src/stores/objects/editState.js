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
			verticalAlign: "middle" // 3 verticalAlign icons
		},
		background: {
			fill: "#ffffff", // color picker
			alpha: 1, // range slider
		},
	};

	imageParameters = {
		source: "/placeholder.jpg", // file picker
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

    constructor(domainStore, intent, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, this, "edit-" + randomUUID(), trackId);
		this.intent = intent;
		this.adjustedVideos = [];
		this.excludedIds = [];
    }

	getDeepCopy() {
		const newEdit = new EditState(this.domainStore, this.intent, this.commonState.trackId);
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

	split(offsetTimestamp) {
		const { 
			left,
			right
		} = this.commonState.splitObject(offsetTimestamp);

        //const nativeTimestamp = this.commonState.offsetToNative(offsetTimestamp);
		// probably do something for zoom, blur, crop, cut
		return { 
			left,
			right
		};
    }

	replaceSelf(edits) {
		this.intent.deleteEdits([this.commonState.id]);
		this.intent.activeEdits = [
			...this.intent.activeEdits, ...edits];
	}

	setCustomParameters(parameters) {
		if (this.intent.editOperation === null) {
			return;
		}
		if (this.title === "Text") {
			this.textParameters = { 
				...this.textParameters,
				...parameters,
				style: {
					...this.textParameters.style,
					...parameters.style,
				},
				background: {
					...this.textParameters.background,
					...parameters.background,
				}
			};
		}
		if (this.title === "Image") {
			this.imageParameters = {
				...this.imageParameters,
				...parameters
			};
		}
		if (this.title === "Shape") {
			this.shapeParameters = {
				...this.shapeParameters,
				...parameters
			};
		}
		if (this.title === "Zoom") {
			this.zoomParameters = {
				...this.zoomParameters,
				...parameters
			};
		}
		if (this.title === "Crop") {
			this.cropParameters = {
				...this.cropParameters,
				...parameters
			};
		}
		if (this.title === "Cut") {
			this.cutParameters = {
				...this.cutParameters,
				...parameters
			};
		}
		if (this.title === "Blur") {
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
			width: this.commonState.width,
			height: this.commonState.height,
			// scaleX: this.commonState.scaleX,
			// scaleY: this.commonState.scaleY,
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
		if (this.title === "Text") {
			return this.textParameters;
		}
		if (this.title === "Image") {
			return this.imageParameters;
		}
		if (this.title === "Shape") {
			return this.shapeParameters;
		}

		if (this.title === "Zoom") {
			return this.zoomParameters;
		}
		if (this.title === "Crop") {
			return this.cropParameters;
		}

		if (this.title === "Cut") {
			return this.cutParameters;
		}
		if (this.title === "Blur") {
			return this.blurParameters;
		}
		return null;
	}

	get metaParameters() {
		if (this.intent.editOperation === null) {
			return {};
		}
		if (this.title === "Cut"
			|| this.title === "Blur"
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

	get title() {
		if (this.intent.editOperation === null) {
			return null;
		}
		return this.intent.editOperation.title;
	}

	get isActive() {
		return this.intent.id === this.domainStore.curIntent.id;
	}

	get leftTimelineLimit() {
		return this.intent.activeEdits.reduce((prev, otherEdit) => {
			if (otherEdit.commonState.id === this.commonState.id) {
				return prev;
			}
			if (otherEdit.commonState.end <= this.commonState.offset) {
				return Math.max(prev, otherEdit.commonState.end);
			}
			return prev;	
		}, 0);
	}

	get rightTimelineLimit() {
		return this.intent.activeEdits.reduce((prev, otherEdit) => {
			if (otherEdit.commonState.id === this.commonState.id) {
				return prev;
			}
			if (otherEdit.commonState.offset >= this.commonState.end) {
				return Math.min(prev, otherEdit.commonState.offset);
			}
			return prev;
		}, this.domainStore.projectMetadata.duration);
	}

	get numberParameterConfig() {
		const canvasWidth =  this.domainStore.rootStore.uiStore.canvasSize.width;
		const canvasHeight =  this.domainStore.rootStore.uiStore.canvasSize.height;

		const leftLimit = this.leftTimelineLimit;
		const rightLimit = this.rightTimelineLimit;

		return {
			"background.alpha": {
				min: 0,
				max: 1,
				step: 0.1,
			},
			"style.fontSize": {
				min: 1,
				max: 100,
				step: 1,
			},
			"x": {
				min: -this.commonState.width,
				max: canvasWidth,
				step: Math.min(canvasWidth, canvasHeight) / 100,
			},
			"y": {
				min: -this.commonState.height,
				max: canvasHeight,
				step: Math.min(canvasWidth, canvasHeight) / 100,
			},
			"z": {
				min: 0,
				max: 100,
				step: 1,
			},
			"width": {
				min: 0,
				max: canvasWidth,
				step: Math.min(canvasWidth, canvasHeight) / 100,
			},
			"height": {
				min: 0,
				max: canvasHeight,
				step: Math.min(canvasWidth, canvasHeight) / 100,
			},
			"start": {
				min: leftLimit,
				max: this.commonState.end,
				step: 1,
			},
			"finish": {
				min: this.commonState.offset,
				max: rightLimit,
				step: 1,
			},
			"duration": {
				min: 0,
				max: rightLimit - leftLimit,
				step: 1,
			},
			"speed": {
				min: 0,
				max: 10,
				step: 0.1,
			},
			"scaleX": {
				min: 0.1,
				max: 1000,
				step: 1,
			},
			"scaleY": {
				min: 0.1,
				max: 1000,
				step: 1,
			},
			"rotation": {
				min: -180,
				max: 180,
				step: 10,
			},
		};
	}
}
 
export default EditState;
