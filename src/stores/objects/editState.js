import { action, makeAutoObservable, toJS } from "mobx";

import CommonState from "./commonState";

import { randomUUID, roundNumber } from "../../utilities/genericUtilities";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";

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

	parent = null;

	parentBubble = null;

	isSuggested = false;

	explanation = [];
	suggestionSource = {
		spatial: [],
		temporal: [],
		edit: [],
		custom: [],
	};
	contribution = [];

	textParameters = {
		content: "HELLO", // text input
		style: {
			fill: "#000000", // color picker
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
		searchQuery: "", // search input
	};

	shapeParameters = {
		type: "rectangle", // dropdown
		background: {
			fill: "#ffffff", // color picker
			alpha: 1, // range slider
		},
		stroke: {
			width: 2,
			fill: "#000000", // color picker
			alpha: 1, // range slider
		},
		// circle: {
		// 	// radiusX: 50, // number input & +/- buttons
		// 	// radiusY: 50, // number input & +/- buttons
		// },
		star: {
			numPoints: 6,
			innerRadius: 100,
			//outerRadius: 70,
		},
	};

	zoomParameters = {
		zoomDurationStart: 3,
		zoomDurationEnd: 3,
	};

	blurParameters = {
		blur: 6, // range slider
	};

	cutParameters = {};

	cropParameters = {
		x: 0, // number input
		y: 0, // number input
		width: 0,
		height: 0,
		cropX: 0,
		cropY: 0,
		cropWidth: 0, // number input
		cropHeight: 0, // number input
	};

    constructor(domainStore, parent, parentBubble, isSuggested, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, this, "edit-" + randomUUID(), trackId);
		this.parent = parent;
		this.parentBubble = parentBubble;
	
		this.isSuggested = isSuggested;
		this.explanation = [];
		this.suggestionSource = {
			spatial: [],
			temporal: [],
			edit: [],
			custom: [],
		};
		this.contribution = []

		this.cropParameters = {
			x: 0,
			y: 0,
			width: domainStore.projectMetadata.width,
			height: domainStore.projectMetadata.height,
			cropX: 0,
			cropY: 0,
			cropWidth: domainStore.projectMetadata.width,
			cropHeight: domainStore.projectMetadata.height,
		};
    }

	getDeepCopy() {
		const newEdit = new EditState(
			this.domainStore, this.parent, this.parentBubble, this.isSuggested, this.commonState.trackId
		);
		newEdit.commonState.setMetadata(this.commonState.metadata);
		
		newEdit.textParameters = {...this.textParameters};
		newEdit.imageParameters = {...this.imageParameters};
		newEdit.shapeParameters = {...this.shapeParameters};
		
		newEdit.zoomParameters = {...this.zoomParameters};
		newEdit.cropParameters = {...this.cropParameters};

		newEdit.cutParameters = {...this.cutParameters};
		newEdit.blurParameters = {...this.blurParameters};

		newEdit.isSuggested = this.isSuggested;
		newEdit.explanation = [...this.explanation];
		newEdit.suggestionSource = {
			spatial: [],
			temporal: [],
			edit: [],
			custom: [],
		};
		for (const key in this.suggestionSource) {
			newEdit.suggestionSource[key] = [...this.suggestionSource[key]];
		}
		newEdit.contribution = [...this.contribution];
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
		//TODO: consider if suggested edit is being replaced?
		if (!this.isSuggested) {
			this.parent.activeEdits = [
				...this.parent.activeEdits, ...edits];
		}
		this.parent.deleteEdits([this.commonState.id]);
	}

	fixZoomDuration() {
		let durationStart = this.zoomParameters.zoomDurationStart;
		let durationEnd = this.zoomParameters.zoomDurationEnd;
		if (durationStart + durationEnd > this.commonState.sceneDuration) {
			durationEnd = Math.max(0.0, this.commonState.sceneDuration - durationStart);
			durationStart = Math.max(0.0, this.commonState.sceneDuration - durationEnd);
		}
		this.zoomParameters.zoomDurationStart = roundNumber(durationStart, 1);
		this.zoomParameters.zoomDurationEnd = roundNumber(durationEnd, 1);
	}

	setCustomParameters(parameters) {
		if (this.parent.editOperation === null) {
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
				...parameters,
				background: {
					...this.shapeParameters.background,
					...parameters.background,
				},
				stroke: {
					...this.shapeParameters.stroke,
					...parameters.stroke,
				},
				// circle: {
				// 	...this.shapeParameters.circle,
				// 	...parameters.circle,
				// },
				star: {
					...this.shapeParameters.star,
					...parameters.star,
				},
			};
		}
		if (this.title === "Zoom") {
			this.zoomParameters = {
				...this.zoomParameters,
				...parameters,
			};
			if (this.zoomParameters.zoomDurationEnd + this.zoomParameters.zoomDurationStart > this.commonState.sceneDuration) {
				this.fixZoomDuration();
			}
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
		if (parameters.circle !== undefined) {
			if (parameters.circle.radiusX !== undefined) {
				this.commonState.setMetadata({
					width: parameters.circle.radiusX * 2,
				});
			}
			if (parameters.circle.radiusY !== undefined) {
				this.commonState.setMetadata({
					height: parameters.circle.radiusY * 2,
				});
			}
			delete parameters.circle;
		}
		if (parameters.star !== undefined) {
			if (parameters.star.outerRadius !== undefined) {
				this.commonState.setMetadata({
					width: parameters.star.outerRadius * 2,
				});
			}
			delete parameters.star;
		}
		this.commonState.setMetadata({ ...parameters });
		if (parameters.info !== undefined) {
			while (this.explanation.length < 2) {
				this.explanation.push([""]);
			}
			this.explanation[1] = parameters.info[0];
		}
		if (parameters.source !== undefined) {
			this.suggestionSource = {
				...this.suggestionSource,
				spatial: [...parameters.source],
			};
			this.contribution = [];
		}
		if (parameters.offsets !== undefined) {
			this.suggestionSource = {
				...this.suggestionSource,
				offsetsSpatial: [...parameters.offsets],
			}
			this.contribution = [];
		}
	}

	setTemporalParameters(parameters) {
		this.commonState.setMetadata({
			offset: parameters.start,
			start: parameters.start,
			finish: parameters.finish,
		});
		if (parameters.duration !== undefined) {
			this.commonState.setMetadata({
				finish: Math.min(this.commonState.start + parameters.duration, this.commonState.duration),
			});
		}
		if (parameters.speed !== undefined) {
			this.commonState.setMetadata({
				speed: parameters.speed,
			});
		}
		if (parameters.info !== undefined) {
			while (this.explanation.length < 1) {
				this.explanation.push([""]);
			}
			this.explanation[0] = parameters.info[0];
		}
		if (parameters.source !== undefined) {
			this.suggestionSource = {
				...this.suggestionSource,
				temporal: [...parameters.source],
			};
			this.contribution = [];
		}
		if (parameters.offsets !== undefined) {
			this.suggestionSource = {
				...this.suggestionSource,
				offsetsTemporal: [...parameters.offsets],
			}
			this.contribution = [];
		}
	}

	get spatialParameters() {
		if (this.title === "Shape") {
			if (this.shapeParameters.type === "circle") {
				return {
					x: this.commonState.x,
					y: this.commonState.y,
					"circle.radiusX": this.commonState.width / 2,
					"circle.radiusY": this.commonState.height / 2,
					rotation: this.commonState.rotation,
				}
			}
			if (this.shapeParameters.type === "star") {
				return {
					x: this.commonState.x,
					y: this.commonState.y,
					"star.outerRadius": this.commonState.width / 2,
					rotation: this.commonState.rotation,
				}
			}
		}
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
			//speed: this.commonState.speed,
		};
	}

	get customParameters() {
		if (this.parent.editOperation === null) {
			return {};
		}
		if (this.title === "Text") {
			return this.textParameters;
		}
		if (this.title === "Image") {
			return this.imageParameters;
		}
		if (this.title === "Shape") {
			let shapeParameters = {
				...this.shapeParameters
			};
			if (this.shapeParameters.type === "rectangle") {
				delete shapeParameters.star;
			}
			if (this.shapeParameters.type === "circle") {
				delete shapeParameters.star;
			}
			//console.log(this.shapeParameters.type, shapeParameters)
			return shapeParameters;
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
		if (this.parent.editOperation === null) {
			return {
				spatial: this.spatialParameters,
				temporal: this.temporalParameters,
				custom: null,
			};
		}
		if (this.title === "Cut"
			|| this.title === "Blur"
			|| this.title === "Crop"
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
		if (this.parent.editOperation === null) {
			return null;
		}
		return this.parent.editOperation.title;
	}

	get isActive() {
		return this.parent.id === this.domainStore.curTab.id;
	}

	static getCustomParameters(editOperation) {
		if (editOperation === null) {
			return null;
		}
		if (editOperation.title === "Text") {
			return {
				content: "HELLO", // text input
				style: {
					fill: "#000000", // color picker
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
		}
		if (editOperation.title === "Image") {
			return {
				source: "/placeholder.jpg", // file picker
				searchQuery: "", // search input
			};
		}
		if (editOperation.title === "Shape") {
			return {
				type: "rectangle", // dropdown
				background: {
					fill: "#ffffff", // color picker
					alpha: 1, // range slider
				},
				stroke: {
					width: 2,
					fill: "#000000", // color picker
					alpha: 1, // range slider
				},
				// circle: {
				// 	// radiusX: 50, // number input & +/- buttons
				// 	// radiusY: 50, // number input & +/- buttons
				// },
				star: {
					numPoints: 6,
					innerRadius: 100,
					//outerRadius: 70,
				},
			};
		}
		if (editOperation.title === "Zoom") {
			return {
				zoomDurationStart: 3,
				zoomDurationEnd: 3,
			};
		}
		if (editOperation.title === "Crop") {
			return {
				x: 0, // number input
				y: 0, // number input
				width: 0,
				height: 0,
				cropX: 0,
				cropY: 0,
				cropWidth: 0, // number input
				cropHeight: 0, // number input
			};
		}
		if (editOperation.title === "Cut") {
			return {};
		}
		if (editOperation.title === "Blur") {
			return {
				blur: 6, // range slider
			};
		}
		return null;
	}

	isVisible(playPosition) {
		if (this.commonState.offset > playPosition || this.commonState.end <= playPosition) {
			return false;
		}
		if (this.parent.editOperation === null) {
			return true;
		}
		if (this.isSuggested && this.parent.idx === this.domainStore.curTab.idx) {
			return true;
		}

		if (this.domainStore.curTab.editOperationKey === this.parent.editOperationKey) {
			for (let suggestedEdit of this.domainStore.curTab.suggestedEdits) {
				if (suggestedEdit.commonState.offset <= playPosition && suggestedEdit.commonState.end > playPosition) {
					return false;
				}
			}
		}

		if (this.parent.editOperation.linearize === false) {
			return true;
		}

		const tabs = this.domainStore.tabs;
		for (let i = this.parent.tabPos + 1; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab.editOperation === null || tab.editOperationKey !== this.parent.editOperationKey) {
				continue;
			}
			for (let edit of tab.activeEdits) {
				if (edit.commonState.offset <= playPosition && edit.commonState.end > playPosition) {
					return false;
				}
			}
		}
        return true;
	}

	get leftTimelineLimit() {
		return this.parent.activeEdits.reduce((prev, otherEdit) => {
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
		return this.parent.activeEdits.reduce((prev, otherEdit) => {
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

		const minWidth = this.domainStore.rootStore.uiStore.canvasConst.minWidth;
		const minHeight = this.domainStore.rootStore.uiStore.canvasConst.minHeight;

		const projectWidth = this.domainStore.projectMetadata.width;
		const projectHeight = this.domainStore.projectMetadata.height;

		const leftLimit = this.leftTimelineLimit;
		const rightLimit = this.rightTimelineLimit;

		return {
			"circle.radiusX": {
				min: minWidth / 2,
				max: Math.min(canvasWidth, canvasHeight) / 2,
				step: roundNumber(projectWidth / 100, 0),
			},
			"circle.radiusY": {
				min: minHeight / 2,
				max: Math.min(canvasWidth, canvasHeight) / 2,
				step: roundNumber(projectHeight / 100, 0),
			},
			"star.numPoints": {
				min: 3,
				max: 100,
				step: 1,
			},
			"star.innerRadius": {
				min: minWidth / 2,
				max: Math.min(canvasWidth, canvasHeight) / 2,
				step: roundNumber(projectWidth / 100, 0),
			},
			"star.outerRadius": {
				min: minWidth / 2,
				max: Math.min(canvasWidth, canvasHeight) / 2,
				step: roundNumber(projectWidth / 100, 0),
			},

			"zoomDurationStart": {
				min: 0,
				max: this.commonState.sceneDuration,
				step: 1,
			},
			"zoomDurationEnd": {
				min: 0,
				max: this.commonState.sceneDuration,
				step: 1,
			},
			"stroke.width": {
				min: 0,
				max: 100,
				step: 1,
			},
			"stroke.alpha": {
				min: 0,
				max: 1,
				step: 0.1,
			},
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
				min: -projectWidth,
				max: projectWidth,
				step: roundNumber(projectWidth / 100, 0),
			},
			"y": {
				min: -projectHeight,
				max: projectHeight,
				step: roundNumber(projectHeight / 100, 0),
			},
			"z": {
				min: 0,
				max: 100,
				step: 1,
			},
			"width": {
				min: minWidth,
				max: canvasWidth,
				step: roundNumber(canvasWidth / 100, 0),
			},
			"height": {
				min: minHeight,
				max: canvasHeight,
				step: roundNumber(canvasHeight / 100, 0),
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
			"cropX": {
				min: -projectWidth,
				max: projectWidth,
				step: 1,
			},
			"cropY": {
				min: -projectHeight,
				max: projectHeight,
				step: 1,
			},
			"cropWidth": {
				min: minWidth,
				max: projectWidth,
				step: 1,
			},
			"cropHeight": {
				min: minHeight,
				max: projectHeight,
				step: 1,
			},
			"blur": {
				min: 0,
				max: 30,
				step: 2,
			},
		};
	}

	get requestBody() {
		const requestBody = {
			id: this.commonState.id,
			textParameters: this.textParameters,
			imageParameters: this.imageParameters,
			shapeParameters: this.shapeParameters,
			zoomParameters: this.zoomParameters,
			cropParameters: this.cropParameters,
			cutParameters: this.cutParameters,
			blurParameters: this.blurParameters,
			spatialParameters: this.spatialParameters,
			temporalParameters: this.temporalParameters,
			numberParameterConfig: this.numberParameterConfig,
		};
		return requestBody;
	}

	setResponseBody(responseBody) {
		this.textParameters = { ...responseBody.textParameters };
		this.imageParameters = { ...responseBody.imageParameters };
		this.shapeParameters = { ...responseBody.shapeParameters };
		this.zoomParameters = { ...responseBody.zoomParameters };
		this.cropParameters = { ...responseBody.cropParameters };
		this.cutParameters = { ...responseBody.cutParameters };
		this.blurParameters = { ...responseBody.blurParameters };
		this.setSpatialParameters(responseBody.spatialParameters);
		this.setTemporalParameters(responseBody.temporalParameters);
	}

	fetchedFromFirebase(edit) {
		/* domainStore, tab, isSuggested, trackId */
		this.textParameters = { ...edit.textParameters };
		this.imageParameters = { ...edit.imageParameters };
		this.shapeParameters = { ...edit.shapeParameters };
		this.zoomParameters = { ...edit.zoomParameters };
		this.cropParameters = { ...edit.cropParameters };
		this.cutParameters = { ...edit.cutParameters };
		this.blurParameters = { ...edit.blurParameters };
		this.commonState = new CommonState(
			this.domainStore,
			this,
			edit.commonState.id,
			edit.commonState.trackId,
		);
		this.isSuggested = edit.isSuggested;
		this.explanation = edit.explanation.slice(0);
		this.suggestionSource = {
			spatial: [],
			temporal: [],
			edit: [],
			custom: [],
		};
		for (const key in edit.suggestionSource) {
			this.suggestionSource[key] = [...edit.suggestionSource[key]];
		}
		this.contribution = edit.contribution.slice(0);
	}

	saveFirebase(userId, taskIdx) {
		const editCollection = collection(firestore,
			this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.editCollection);
		const editId = this.commonState.id;
		const editDoc = doc(editCollection, editId).withConverter(this.editStateConverter);		
		return new Promise((resolve, reject) => {
			setDoc(editDoc, this, {merge: false}).then(() => {
				//console.log(`edit ${editId} saved: `, editId, userId, this.domainStore.rootStore.editCollection);
				resolve();
			}).catch((error) => {
				reject(`edit ${editId} save error: ` + error.message);
			});
		});
	}

	fetchFirebase(userId, taskIdx, editId) {
		const editCollection = collection(firestore,
			this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.editCollection);
		const editDoc = doc(editCollection, editId).withConverter(this.editStateConverter);		
		return new Promise((resolve, reject) => {
			getDoc(editDoc).then(action((fetchedEditState) => {
				//console.log("fetched edit", fetchedEditState);
				const data = fetchedEditState.exists() ? fetchedEditState.data() : null;
				if (data === null || data.commonState === undefined) {
					//TODO: maybe reset edit state
					resolve(false);
				}

				this.textParameters = { ...data.textParameters };
				this.imageParameters = { ...data.imageParameters };
				this.shapeParameters = { ...data.shapeParameters };
				this.zoomParameters = { ...data.zoomParameters };
				this.cropParameters = { ...data.cropParameters };
				this.cutParameters = { ...data.cutParameters };
				this.blurParameters = { ...data.blurParameters };
				this.commonState = new CommonState(
					this.domainStore,
					this,
					data.commonState.id,
					data.commonState.trackId,
				);
				this.commonState.fetchedFromFirebase(data.commonState);
				this.isSuggested = data.isSuggested;
				this.explanation = data.explanation.slice(0);
				this.suggestionSource = {
					spatial: [],
					temporal: [],
					edit: [],
					custom: [],
				};
				for (const key in data.suggestionSource) {
					this.suggestionSource[key] = [...data.suggestionSource[key]];
				}
				this.contribution = data.contribution.slice(0);
				resolve(true);
			})).catch((error) => {
				reject("edit fetch error: " + error.message);
			});
		});
	}

	editStateConverter = {
		toFirestore: function(editState) {
			const data = {
				textParameters: { ...toJS(editState.textParameters) },
				imageParameters: { ...toJS(editState.imageParameters) },
				shapeParameters: { ...toJS(editState.shapeParameters) },
				zoomParameters: { ...toJS(editState.zoomParameters) },
				cropParameters: { ...toJS(editState.cropParameters) },
				cutParameters: { ...toJS(editState.cutParameters) },
				blurParameters: { ...toJS(editState.blurParameters) },
				commonState: editState.commonState.commonStateConverter.toFirestore(editState.commonState),
				isSuggested: editState.isSuggested,
				explanation: editState.explanation.slice(0),
				suggestionSource: {
					spatial: [],
					temporal: [],
					edit: [],
					custom: [],
				},
				contribution: editState.contribution.slice(0),
			};
			for (const key in editState.suggestionSource) {
				data.suggestionSource[key] = [...editState.suggestionSource[key]];
			}
			//console.log("to", data);
			return data;
		},
		fromFirestore: function(snapshot, options) {
			const data = snapshot.data(options);
			//console.log("from", data);
			return data;
		}
	}
}
 
export default EditState;
