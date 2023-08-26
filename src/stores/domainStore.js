import { makeAutoObservable, toJS } from "mobx";

import VideoState from "./objects/videoState";
import IntentState from "./intentState";

class DomainStore {
	in_mainVideos = [];
	
	intents = [];
	curIntentPos = 0;

    projectMetadata = {
        projectId: "test",
        title: "TEST",
        fps: 25,
        width: 854,
        height: 480, //720p
        duration: 10, // seconds
        trackCnt: 2,
		totalIntentCnt: 0,
    };

	editOperations = {
		"text": {
			title: "Text",
			icon: null,
			supported: true,
			linearize: false,
		},
		"image": {
			title: "Image",
			icon: null,
			supported: true,
			linearize: false,
		},
		"shape": {
			title: "Shape",
			icon: null,
			supported: true,
			linearize: false,
		},
		"cut": {
			title: "Cut",
			icon: null,
			supported: true,
			linearize: true,
		},
		"crop": {
			title: "Crop",
			icon: null,
			supported: true,
			linearize: true,
		},
		"zoom": {
			title: "Zoom",
			icon: null,
			supported: true,
			linearize: true,
		},
		"blur": {
			title: "Blur",
			icon: null,
			supported: true,
			linearize: true,
		},
	};

	inputOperationMapping = {
		text: [
			"content",
		],
		file: [
			"source",
		],
		dropdown: [
			"type",
			"style.fontFamily",
		],
		color: [
			"style.fill",
			"background.fill",
			"stroke.fill",
		],
		range: [
			"background.alpha",
			"stroke.alpha",
		],
		number: [
			"zoomDurationStart",
			"zoomDurationEnd",
			"stroke.width",
			"style.fontSize",
			"x",
			"y",
			"z",
			"width",
			"height",
			"start",
			"finish",
			"duration",
			"speed",
			"scaleX",
			"scaleY",
			"rotation",
			"cropX",
			"cropY",
			"cropWidth",
			"cropHeight",
			"blur",
		],
		toggle: [
			"cropped",
		],
		align: [
			"style.align",
			"style.verticalAlign",
		],
	};
	
	dropdownOptions = {
		"style.fontFamily": [
			"Arial",
			"Times New Roman",
			"Courier New",
		],
		"type": [
			"rectangle",
			"circle",
			"star",
		],
		"style.align": [
			"left",
			"center",
			"right",
		],
		"style.verticalAlign": [
			"top",
			"middle",
			"bottom",
		],
	};

	skipParameterIfMultiple = [
		"source",
		"start",
		"finish",
		"duration",
		"speed",
	];

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;

		this.in_mainVideos = [];

		this.projectMetadata.totalIntentCnt = 1;
        this.intents = [
				new IntentState(this, this.projectMetadata.totalIntentCnt, "", [], -1, 0)
		];
		this.curIntentPos = 0;
    }

	addIntent() {
		this.curIntentPos = this.intents.length;
		this.projectMetadata.totalIntentCnt += 1;
		this.intents.push(
			new IntentState(this, this.projectMetadata.totalIntentCnt, "", [], -1, 0)
		);

		this.rootStore.resetTempState();
	}
	
	addRandomIntent() {
		this.curIntentPos = this.intents.length;
		this.projectMetadata.totalIntentCnt += 1;
		const newIntent = new IntentState(this, this.projectMetadata.totalIntentCnt, "", [], -1, 0);

		const randomEditOperationKey = Object.keys(this.editOperations)[Math.floor(Math.random() * Object.keys(this.editOperations).length)];
		const randomSuggestedEditOperationKey = Object.keys(this.editOperations)[Math.floor(Math.random() * Object.keys(this.editOperations).length)];
		const randomConsiderEdits = Math.random() > 0.5;
		const randomTextCommand = Math.random() > 0.5 ? "add" : "remove";
		const randomSketchCommand = Math.random() > 0.5 ? [
			{"x":301.33360941977077,"y":89.85530200080066,"width":389.0716332378223,"height":348.4185179622882,"stroke":"red","strokeWidth":2,"lineCap":"round","lineJoin":"round"}
		] : [];
		const randomSketchPlayPosition = Math.random() * this.projectMetadata.duration;
		
		newIntent.setEditOperationKey(randomEditOperationKey);
		newIntent.suggestedEditOperationKey = randomSuggestedEditOperationKey;
		newIntent.considerEdits = randomConsiderEdits;
		newIntent.textCommand = randomTextCommand;
		newIntent.sketchCommand = randomSketchCommand;
		newIntent.sketchPlayPosition = randomSketchPlayPosition;
		
		const randomEditsLength = Math.floor(Math.random() * 5);
		const randomSuggestedEditsLength = Math.floor(Math.random() * 5);
		for (let i = 0; i < randomEditsLength; i++) {
			newIntent.addRandomEdit(false);
		}
		for (let i = 0; i < randomSuggestedEditsLength; i++) {
			newIntent.addRandomEdit(true);
		}

		this.intents.push(newIntent);

		this.rootStore.resetTempState();
	}

	deleteIntent(intentPos) {
		if (intentPos >= this.intents.length || intentPos < 0) {
			return;
		}
		this.intents = this.intents.filter((intent, idx) => idx !== intentPos);
		this.intents = this.intents.map((intent, idx) => {
			if (idx < intentPos) {
				return intent;
			}
			for (let edit of intent.activeEdits) {
				edit.commonState.setMetadata({
					z: idx + 1,
				});
			}
			for (let edit of intent.suggestedEdits) {
				edit.commonState.setMetadata({
					z: idx + 1,
				});
			}
			return intent;
		});
		this.curIntentPos = this.intents.length - 1;
		if (this.curIntentPos < 0) {
			this.addIntent();
		}
		this.rootStore.resetTempState();
	}

	moveIntent(intentPos, newPos) {
		console.log("moving", intentPos, newPos);
	}

	copyIntentToCurrent(intentPos) {
		if (intentPos >= this.intents.length || intentPos < 0) {
			return;
		}
		const deepCopy = this.intents[intentPos].getDeepCopy();
		deepCopy.idx = this.intents[this.curIntentPos].idx;
		this.intents[this.curIntentPos] = deepCopy;
		for (let edit of deepCopy.activeEdits) {
			edit.commonState.setMetadata({
				z: this.curIntentPos + 1,
			});
		}
		for (let edit of deepCopy.suggestedEdits) {
			edit.commonState.setMetadata({
				z: this.curIntentPos + 1,
			});
		}
		this.rootStore.resetTempState();
	}

	setCurIntent(intentPos) {
		if (intentPos >= this.intents.length || intentPos < 0) {
			return;
		}
		this.curIntentPos = intentPos;
		this.rootStore.resetTempState();
	}

	processIntent() {
		// request
		const requestData = {
			projectId: "",
			projectMetadata: {},
			edits: [],
			requestParameters: {},
			editParameterOptions: toJS({ ...this.dropdownOptions }),
			editOperations: Object.keys(toJS(this.editOperations)),
		};
		requestData.projectId = toJS(this.projectMetadata.projectId);
		requestData.projectMetadata = toJS({
			...this.projectMetadata
		});
		requestData.edits = [...this.curIntent.activeEdits].map((edit) => {
			return toJS(edit.requestBody);
		});
		requestData.requestParameters = toJS({
			...this.curIntent.requestParameters,
		});

		// response
		// make sure zIndex is fine
		// make sure to edit suggesteEditOperationKey and remove it if they are equal

		this.curIntent.suggestedEdits = [];
		const parseData = {
			projectId: "",
			edits: [{
				textParameters: {
				},
				imageParameters: {
				},
				shapeParameters: {
				},
				zoomParameters: {
				},
				cropParameters: {
				},
				cutParameters: {
				},
				blurParameters: {
				},
				spatialParameters: {
					x: 0,
					y: 0,
					width: 200,
					height: 200,
					rotation: 0,
				},
				temporalParameters: {
					start: 0,
					finish: 10,
					duration: 10,
				},
			}],
			requestParameters: {
				consdierEdits: true,
				text: "",
				sketchRectangles: [],
				sketchFrameTimestamp: -1,
				editOperation: "text",
			},
		};
		return requestData;
	}

	// linearizeEdits(editHierarchy) {
	// 	let result = [];
	// 	for (let edits of editHierarchy) {
	// 		for (let edit of edits) {
	// 			const editCopy = edit.getDeepCopy();
	// 			for (let prevEdit of result) {
	// 				const left = Math.max(prevEdit.commonState.offset, editCopy.commonState.offset);
	// 				const right = Math.min(prevEdit.commonState.end, editCopy.commonState.end);
	// 				if (left >= right) {
	// 					continue;
	// 				}
	// 				let metadataUpdate = {};
	// 				if (prevEdit.commonState.offset <= editCopy.commonState.offset) {
	// 					metadataUpdate = {
	// 						finish: editCopy.commonState.offset,
	// 					};
	// 				}
	// 				else if (prevEdit.commonState.end >= editCopy.commonState.end) {
	// 					metadataUpdate = {
	// 						start: editCopy.commonState.end,
	// 						offset: editCopy.commonState.end,
	// 					};
	// 				}
	// 				else {
	// 					metadataUpdate = {
	// 						start: 0,
	// 						offset: 0,
	// 						finish: 0,
	// 					}
	// 				}
	// 				prevEdit.commonState.setMetadata(metadataUpdate);
	// 			}
	// 			result.push(editCopy);
	// 		}
	// 	}
	// 	return result.filter((edit) => edit.commonState.sceneDuration > 0);
	// }

	getVideoById(id) {
		return this.in_mainVideos.find((video) => video.commonState.id === id);
	}

    get transcripts() {
        let transcript = [];
        for (let video of this.videos) {
            transcript = [...transcript, ...video.adjustedTranscript];
        }
        transcript.sort((p1, p2) => p1.start - p2.start);
		let transcript_with_pauses = [];
		for (let i = 0; i < transcript.length; i++) {
			const curTranscript = transcript[i];
			if (i === 0 && curTranscript.start > 0) {
				transcript_with_pauses.push({
					start: 0,
					finish: curTranscript.start,
					text: "[PAUSE]",
				});
			}
			if (i > 0) {
				const lastTranscript = transcript_with_pauses[transcript_with_pauses.length - 1];
				if (lastTranscript.finish < curTranscript.start) {
					transcript_with_pauses.push({
						start: lastTranscript.finish,
						finish: curTranscript.start,
						text: "[PAUSE]",
					});
				}
			}
			transcript_with_pauses.push(curTranscript);
		}
		if (transcript_with_pauses.length === 0) {
			return [{
				start: 0,
				finish: this.projectMetadata.duration,
				text: "[PAUSE]",
			}];
		}
		const lastTranscript = transcript_with_pauses[transcript_with_pauses.length - 1];
		if (lastTranscript.finish < this.projectMetadata.duration) {
			transcript_with_pauses.push({
				start: lastTranscript.finish,
				finish: this.projectMetadata.duration,
				text: "[PAUSE]",
			});
		}
        return transcript_with_pauses;
    }

	get transcriptSelectedIndex() {
		const largerIndex = this.transcripts.findIndex((item) => {
			if (item.start > this.rootStore.uiStore.timelineControls.playPosition) {
				return true;
			}
			return false;
		});
	
		return largerIndex === -1 ? (this.transcripts.length - 1) : (largerIndex - 1);
	}

	get videos() {
		return this.in_mainVideos;
	}

	get texts() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Text") {
					result.push(edit);
				}
			}
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Text") {
				result.push(edit);
			}
		}
		return result;
	}

	get images() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Image") {
					result.push(edit);
				}
			}	
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Image") {
				result.push(edit);
			}
		}
		return result;
	}

	get shapes() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Shape") {
					result.push(edit);
				}
			}	
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Shape") {
				result.push(edit);
			}
		}
		return result;
	}

	get skippedParts() {
		let result = [];
		for (let intent of this.intents) {
			if (intent.id === this.curIntent.id) {
				continue;
			}
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Cut") {
					result.push(edit);
				}
			}
		}
		return result;
	}

	get allSkippedParts() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Cut") {
					result.push(edit);
				}
			}
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Cut") {
				result.push(edit);
			}
		}
		return result;
	}

	get crops() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Crop") {
					result.push(edit);
				}
			}
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Crop") {
				result.push(edit);
			}
		}
		return result;
	}

	get zooms() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Zoom") {
					result.push(edit);
				}
			}
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Zoom") {
				result.push(edit);
			}
		}
		return result;
	}

	get blurs() {
		let result = [];
		for (let intent of this.intents) {
			for (let edit of intent.activeEdits) {
				if (intent.editOperation === null) {
					continue;
				}
				if (intent.editOperation.title === "Blur") {
					result.push(edit);
				}
			}
		}
		for (let edit of this.curIntent.suggestedEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Blur") {
				result.push(edit);
			}
		}
		return result;
	}

	get orderedAllObjects() {
		const texts = this.texts;
		const images = this.images;
		const shapes = this.shapes;
		const skippedParts = this.allSkippedParts;
		const crops = this.crops;
		const zooms = this.zooms;
		const blurs = this.blurs;
		const objects = [
			...texts,
			...images,
			...shapes,
			...skippedParts,
			...crops,
			...zooms,
			...blurs
		].filter((object) => object.intent.idx !== this.curIntent.idx);
		objects.sort((a, b) => a.commonState.z - b.commonState.z);
		
		if (this.curIntent.editOperation !== null) {
			return [...objects, ...this.curIntent.activeEdits, ...this.curIntent.suggestedEdits];
		}
		return objects;
	}

	get curIntent() {
		return this.intents[this.curIntentPos];
	}

	get curVideo() {
		if (this.in_mainVideos.length === 0) {
			return null;
		}
		return this.in_mainVideos[0];
	}
}

export default DomainStore;
