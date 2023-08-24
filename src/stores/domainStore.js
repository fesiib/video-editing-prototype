import { makeAutoObservable } from "mobx";

import VideoState from "./objects/videoState";
import IntentState from "./intentState";

class DomainStore {
	in_mainVideos = [];
	in_texts = [];
	in_images = [];
	in_shapes = [];
	
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
		this.in_texts = [];
		this.in_images = [];
		this.in_shapes = [];

        this.intents = [
				new IntentState(this, "", "todo", 0)
		];
		this.curIntentPos = 0;
    }

	confirmIntent() {
		if (this.curIntentPos === this.intents.length - 1) {
			this.curIntentPos = this.intents.length;
			this.intents.push(
				new IntentState(this, "", "todo", 0)
			);
		}
		else {
			this.curIntentPos = this.intents.length - 1;
		}
		this.rootStore.resetTempState();
	}

	cancelIntent() {
		if (this.curIntentPos === this.intents.length - 1) {
			this.intents.pop();
			this.curIntentPos = this.intents.length;
			this.intents.push(
				new IntentState(this, "", "todo", 0)
			);
		}
		else {
			this.intents = this.intents.filter((intent, idx) => idx !== this.curIntentPos);
			this.intents = this.intents.map((intent, idx) => {
				if (idx < this.curIntentPos) {
					return intent;
				}
				for (let edit of intent.activeEdits) {
					edit.commonState.setMetadata({
						z: idx + 1,
					});
				}
				return intent;
			});
			this.curIntentPos = this.intents.length - 1;
		}
		this.rootStore.resetTempState();
	}

	copyIntentToCurrent(intentPos) {
		if (intentPos >= this.intents.length - 1 || intentPos < 0) {
			return;
		}
		const deepCopy = this.intents[intentPos].getDeepCopy();
		this.intents.pop();
		this.curIntentPos = this.intents.length;
		this.intents.push(deepCopy);
		for (let edit of deepCopy.activeEdits) {
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
		// let result = [];
		// const excludedIds = this.curIntent.allExcludedIds;
		// for (let video of this.in_mainVideos) {
		// 	if (excludedIds.findIndex((excludedId) => excludedId === video.commonState.id) === -1) {
		// 		result.push(video);
		// 	}
		// }
		// for (let edit of this.curIntent.activeEdits) {
		// 	for (let object of edit.adjustedVideos) {
		// 		result.push(object);
		// 	}
		// }
		// return result;
		return this.in_mainVideos;
	}

	get texts() {
		let result = [];
		// const excludedIds = this.curIntent.allExcludedIds;
		// for (let text of this.in_texts) {
		// 	if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
		// 		result.push(text);
		// 	}
		// }
		// for (let edit of this.curIntent.activeEdits) {
		// 	if (this.curIntent.editOperation === null) {
		// 		continue;
		// 	}
		// 	if (this.curIntent.editOperation.title === "Text") {
		// 		result.push(edit);
		// 	}
		// }
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
		return result;
	}

	get images() {
		let result = [];
		// const excludedIds = this.curIntent.allExcludedIds;
		// for (let text of this.in_images) {
		// 	if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
		// 		result.push(text);
		// 	}
		// }
		// for (let edit of this.curIntent.activeEdits) {
		// 	if (this.curIntent.editOperation === null) {
		// 		continue;
		// 	}
		// 	if (this.curIntent.editOperation.title === "Image") {
		// 		result.push(edit);
		// 	}
		// }
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
		return result;
	}

	get shapes() {
		let result = [];
		// const excludedIds = this.curIntent.allExcludedIds;
		// for (let text of this.in_shapes) {
		// 	if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
		// 		result.push(text);
		// 	}
		// }
		// for (let edit of this.curIntent.activeEdits) {
		// 	if (this.curIntent.editOperation === null) {
		// 		continue;
		// 	}
		// 	if (this.curIntent.editOperation.title === "Shape") {
		// 		result.push(edit);
		// 	}
		// }
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
		const objects = [...texts, ...images, ...shapes, ...skippedParts, ...crops, ...zooms, ...blurs];
		objects.sort((a, b) => a.commonState.z - b.commonState.z);
		return objects;
	}

	// get activeEdits() {
	// 	return this.curIntent.activeEdits;
	// }

	get curIntent() {
		return this.intents[this.curIntentPos];
	}
}

export default DomainStore;
