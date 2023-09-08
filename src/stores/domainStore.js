import { action, makeAutoObservable, runInAction, toJS } from "mobx";

import VideoState from "./objects/videoState";
import IntentState from "./intentState";
import { firestore } from "../services/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { requestSuggestions, requestSummary } from "../services/pipeline";
import EditState from "./objects/editState";

class DomainStore {
	domainDoc = "domain";

	processingIntent = false;

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
        trackCnt: 1,
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
			"star.numPoints",
			"star.innerRadius",
			"star.outerRadius",
			"circle.radiusX",
			"circle.radiusY",
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
			"type",
			"style.align",
			"style.verticalAlign",
		],
		search: [
			"searchQuery",
		],
	};

	operationNameMapping = {
		"content": "Text",
		"source": "Image",
		"searchQuery" : "Search",
		"type": "Shape",
		"style.fontFamily": "Font Family",
		"style.fill": "Color",
		"background.fill": "BG Color",
		"stroke.fill": "Stroke Color",
		"background.alpha": "BG Opacity",
		"stroke.alpha": "Stroke Opacity",
		"stroke.width": "Stroke Width",
		"style.fontSize": "Font Size",
		"x": "X",
		"y": "Y",
		"z": "Z",
		"width": "Width",
		"height": "Height",
		"start": "Start",
		"finish": "Finish",
		"duration": "Duration",
		"speed": "Speed",
		"scaleX": "Scale X",
		"scaleY": "Scale Y",
		"rotation": "Rotation",
		"cropX": "Crop X",
		"cropY": "Crop Y",
		"cropWidth": "Crop Width",
		"cropHeight": "Crop Height",
		"blur": "Blur",
		"cropped": "Cropped",
		"style.align": "Align",
		"style.verticalAlign": "Vertical Align",
		"zoomDurationStart": "Zoom Duration Beg.",
		"zoomDurationEnd": "Zoom Duration End",
		"star.numPoints": "Points",
		"star.innerRadius": "Inner Radius",
		"star.outerRadius": "Outer Radius",
		"circle.radiusX": "Radius X",
		"circle.radiusY": "Radius Y",
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
		"searchQuery",
		"start",
		"finish",
		"duration",
		"speed",
	];

	processingModes = {
		fromScratch: "from-scratch",
		addMore: "add-more",
		adjustSelected: "adjust-selected",
	};

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

	loadVideo(videoLink, videoId) {
		this.resetAll();
		this.projectMetadata.projectId = videoId;
        this.in_mainVideos = [
			new VideoState(
				this,
				this.in_mainVideos,
				videoLink,
				0,
				true,
			),
		];
		this.projectMetadata.trackCnt = 1;
	}

	resetAll() {
		this.in_mainVideos = [];
		this.projectMetadata = {
			projectId: "test",
			title: "TEST",
			fps: 25,
			width: 854,
			height: 480, //720p
			duration: 10, // seconds
			trackCnt: 1,
			totalIntentCnt: 1,
		};
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
		const systemSetting = this.rootStore.userStore.systemSetting;
		this.curIntentPos = this.intents.length;
		this.projectMetadata.totalIntentCnt += 1;
		const newIntent = new IntentState(this, this.projectMetadata.totalIntentCnt, "", [], -1, 0);

		const randomEditOperationKey = Object.keys(this.editOperations)[Math.floor(Math.random() * Object.keys(this.editOperations).length)];
		
		newIntent.setEditOperationKey(randomEditOperationKey);

		const historyLength = Math.floor(Math.random() * 5);
				
		const randomEditsLength = Math.floor(Math.random() * 5);
		for (let i = 0; i < randomEditsLength; i++) {
			newIntent.addRandomEdit(false);
		}

		for (let h = 0; h < historyLength; h++) {
			const randomSuggestedEditOperationKey = Object.keys(this.editOperations)[Math.floor(Math.random() * Object.keys(this.editOperations).length)];
			const randomSuggestedEditOperationKeys = [randomSuggestedEditOperationKey];
			//const randomProcessingMode = Math.random() < 0.5 ? "from-scratch" : "add-more";
			const randomProcessingMode = "from-scratch";
			const randomTextCommand = (Math.random() > 0.5 ? "Whenever there is something happening do another thing with this!!!"
				: "random goal goal random 2 goalie lol kek cheburek 22 kljaldf 10");
			const randomSketchCommand = Math.random() > 0.5 ? [
				{"x":301.33360941977077,"y":89.85530200080066,"width":389.0716332378223,"height":348.4185179622882,"stroke":"red","strokeWidth":2,"lineCap":"round","lineJoin":"round"}
			] : [];
			const randomSketchPlayPosition = Math.random() * this.projectMetadata.duration;

			newIntent.suggestedEditOperationKey = randomSuggestedEditOperationKey;
			newIntent.suggestedEditOperationKeys = randomSuggestedEditOperationKeys;
			newIntent.processingMode = randomProcessingMode;
			newIntent.textCommand = randomTextCommand;
			newIntent.summary = randomTextCommand;
			newIntent.sketchCommand = randomSketchCommand;
			newIntent.sketchPlayPosition = randomSketchPlayPosition;
			newIntent.suggestedEdits = [];

			const randomSuggestedEditsLength = systemSetting ? Math.floor(Math.random() * 5) : 0;
			for (let i = 0; i < randomSuggestedEditsLength; i++) {
				newIntent.addRandomEdit(true);
			}
			newIntent.enterHistory();
		}
		newIntent.historyPos = newIntent.history.length - 1;

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
			for (let entry of intent.history) {
				for (let edit of entry.suggestedEdits) {
					edit.commonState.setMetadata({
						z: idx + 1,
					});
				}
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
		for (let entry of deepCopy.history) {
			for (let edit of entry.suggestedEdits) {
				edit.commonState.setMetadata({
					z: this.curIntentPos + 1,
				});
			}
		}
		this.rootStore.resetTempState();
	}

	setCurIntent(intentPos) {
		if (intentPos >= this.intents.length || intentPos < 0) {
			return;
		}
		this.curIntentPos = intentPos;
		if (this.curIntentPos >= 0 && this.curIntentPos < this.intents.length
			&& this.intents[this.curIntentPos].history.length > 0
		) {
			this.intents[this.curIntentPos].restoreHistory(
				this.intents[this.curIntentPos].history.length - 1,
			);
		}
		this.rootStore.resetTempState();
	}

	processIntent(processingMode="from-scratch") {
		if (this.processingIntent) {
			return;
		}
		this.processingIntent = true;
		// request
		const requestData = {
			projectId: "",
			projectMetadata: {},
			edits: [],
			skippedSegments: [],
			requestParameters: {},
			editParameterOptions: toJS({ ...this.dropdownOptions }),
			editOperations: Object.keys(toJS(this.editOperations)),
		};
		requestData.projectId = toJS(this.projectMetadata.title);
		requestData.projectMetadata = toJS({
			...this.projectMetadata
		});
		requestData.edits = [...this.curIntent.activeEdits].map((edit) => {
			return toJS(edit.requestBody);
		});
		requestData.requestParameters = toJS({
			...this.curIntent.requestParameters,
			processingMode: processingMode,
		});

		requestData.skippedSegments = [...this.skippedParts].map((edit) => {
			return {
				temporalParameters: {
					start: edit.commonState.offset,
					finish: edit.commonState.end,
					duration: edit.commonState.sceneDuration,
				}
			};
		});

		// response
		// make sure zIndex is fine
		// make sure to edit suggesteEditOperationKey and remove it if they are equal

		this.curIntent.enterHistory();
		this.curIntent.restoreHistory(this.curIntent.history.length - 1);
		// this.curIntent.historyPos = this.curIntent.history.length - 1;	
		this.curIntent.suggestedEdits = [];
		this.curIntent.suggestedEditOperationKeys = [];
		this.curIntent.suggestedEditOperationKey = "";	

		requestSummary({
			input: requestData.requestParameters.text,
		}).then(action((responseData) => {
			if (responseData === null || responseData.summary === undefined) {
				this.processingIntent = false;
				return;
			}
			const summary = responseData.summary;
			// if (this.curIntent.summary === "") {
			// 	this.curIntent.summary = summary;
			// } else {
			// 	this.curIntent.summary = this.curIntent.summary + "\n" + summary;
			// }
			
			this.curIntent.restoreHistory(this.curIntent.history.length - 1);
			this.curIntent.summary = summary;
			requestSuggestions(requestData).then(action((responseData) => {
				if (responseData === null || responseData.edits === undefined) {
					this.processingIntent = false;
					return;
				}
				const suggestedEditOperationKeys = responseData.requestParameters.editOperations;
				const suggestedParameters = responseData.requestParameters.parameters;
				const suggestedEditOperationKey	= responseData.requestParameters.editOperation;
				const suggestedEdits = responseData.edits;
				this.curIntent.suggestedEdits = suggestedEdits.map((edit) => {
					const newEdit = new EditState(this, this.curIntent, true, this.curIntent.trackId);
					newEdit.commonState.setMetadata({
						duration: this.projectMetadata.duration,
						z: this.curIntent.intentPos + 1,
					});
					newEdit.suggestionSource = {
						temporal: [],
						spatial: [],
						custom: [],
						edit: [],
					};
					newEdit.setResponseBody({
						...edit,
						suggestedParameters: suggestedParameters,
					});
					
					newEdit.contribution = [{
						text: requestData.requestParameters.text,
						type: [],
					}];
					for (let parameterKey in suggestedParameters) {
						newEdit.suggestionSource[`custom.${parameterKey}`] = suggestedParameters[parameterKey].slice(0);
					}
					for (let key in newEdit.suggestionSource) {
						for (let source of newEdit.suggestionSource[key]) {
							let newContribution = [];
							for (let single of newEdit.contribution) {
								const text = single.text;
								const type = single.type;
								if (type.includes(key) === true) {
									newContribution.push(single);
									continue;
								}
								if (text.includes(source)) {
									const parts = text.split(source);
									for (let part_idx = 0; part_idx < parts.length - 1; part_idx++) {
										let part = parts[part_idx];
										if (part_idx === 0) {
											part = part.trimEnd();
										}
										else {
											part = part.trim();
										}
										if (part !== "") {
											newContribution.push({
												text: part,
												type: type.slice(0),
											});
										}
										newContribution.push({
											text: source,
											type: [...type.slice(0), key],
										});
									}
									let lastPart = parts[parts.length - 1];
									if (lastPart !== "") {
										newContribution.push({
											text: lastPart.trimStart(),
											type: type.slice(0),
										});
									}
								}
								else {
									//console.log("could not find", source, "in", text);
									newContribution.push(single);
								}
							}
							newEdit.contribution = newContribution.slice(0);
						}
					}
					return newEdit;
				});
				// if (suggestedEditOperationKey !== this.curIntent.editOperationKey) {
				// 	this.curIntent.suggestedEditOperationKey = suggestedEditOperationKey;
				// }
				// else {
				// 	this.curIntent.suggestedEditOperationKey = "";
				// }
				if (suggestedEditOperationKeys.includes(this.curIntent.editOperationKey)) {
					this.curIntent.suggestedEditOperationKeys = suggestedEditOperationKeys.filter((key) => key !== this.curIntent.editOperationKey);
				}
				else {
					this.curIntent.suggestedEditOperationKeys = suggestedEditOperationKeys;
				}
				this.curIntent.restoreHistory(this.curIntent.history.length - 1);
				this.processingIntent = false;
				if (this.curIntent.suggestedEdits.length === 0) {
					alert("Could not find relevant segment in the video!");
				}

			})).catch(action((error) => {
				console.log("error", error);
				this.curIntent.restoreHistory(this.curIntent.history.length - 1);
				this.processingIntent = false;
				alert("Sorry error occured");
			}));
		})).catch(action((error) => {
			console.log("error", error);
			this.curIntent.restoreHistory(this.curIntent.history.length - 1);
			this.processingIntent = false;
			alert("Sorry error occured");
		}));
	}

	getVideoById(id) {
		return this.in_mainVideos.find((video) => video.commonState.id === id);
	}

    get transcripts() {

		const needPause = (prevEnd, nextStart) => {
			if (prevEnd === nextStart) {
				return false;
			}
			if (prevEnd === this.projectMetadata.duration) {
				return false;
			}
			return nextStart - prevEnd > 3;
		}

        let transcript = [];
        for (let video of this.videos) {
            transcript = [...transcript, ...video.adjustedTranscript];
        }
        transcript.sort((p1, p2) => p1.start - p2.start);
		let transcript_with_pauses = [];
		for (let i = 0; i < transcript.length; i++) {
			const curTranscript = transcript[i];
			if (i === 0 && needPause(0, curTranscript.start)) {
				transcript_with_pauses.push({
					start: 0,
					finish: curTranscript.start,
					text: "[PAUSE]",
				});
			}
			if (i > 0) {
				const lastTranscript = transcript_with_pauses[transcript_with_pauses.length - 1];
				if (needPause(lastTranscript.finish, curTranscript.start)) {
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
			if (!this.rootStore.userStore.systemSetting) {
				return [...objects, ...this.curIntent.activeEdits];
			}	
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


	saveFirebase(userId, taskIdx) {
		const projectId = this.projectMetadata.projectId;
		const projectCollection = collection(firestore, this.rootStore.collection, userId, projectId);
		const projectDomain = doc(projectCollection, this.domainDoc).withConverter(this.domainStoreConverter);
		return new Promise(async (resolve, reject) => {
			try {
				let allVideoPromises = [];
				for (let video of this.in_mainVideos) {
					allVideoPromises.push(video.saveFirebase(userId, taskIdx));
				}		
				await Promise.all(allVideoPromises);
			} catch (error) {
				reject("videos save error: " + error);
			}
			try {
				let allIntentPromises = [];
				for (let intent of this.intents) {
					allIntentPromises.push(intent.saveFirebase(userId, taskIdx));
				}		
				await Promise.all(allIntentPromises);
			} catch (error) {
				reject("intents save error: " + error);
			}
			setDoc(projectDomain, this, {merge: false}).then(() => {
				resolve();
			}).catch((error) => {
				reject("domain save error: " + error.message);
			});
		});
	}

	fetchFirebase(userId, taskIdx, projectId) {
		const projectCollection = collection(firestore, this.rootStore.collection, userId, projectId);
		const projectDomain = doc(projectCollection, this.domainDoc).withConverter(this.domainStoreConverter);
		return new Promise((resolve, reject) => {
			getDoc(projectDomain).then(action(async (fetchedDomainStore) => {
				const data = fetchedDomainStore.exists() ? fetchedDomainStore.data() : null;
				if (data === null || data.projectMetadata === undefined) {
					this.resetAll();
					resolve();
				}
				this.in_mainVideos = [];
				this.intents = [];
				this.projectMetadata = {
					...data.projectMetadata,
				};
				this.curIntentPos = data.curIntentPos;
				for (let videoId of data.in_mainVideos) {
					const newVideo = new VideoState(
						this,
						this.in_mainVideos,
						"",
						0,
						false,
					);
					try {
						const success = await newVideo.fetchFirebase(userId, taskIdx, videoId);
						if (success) {
							runInAction(() => {
								this.in_mainVideos.push(newVideo);
							});
						}
					} catch (error) {
						console.log(error);
					}
				}

				for (let intentId of data.intents) {
					const newIntent = new IntentState(
						this,
						0,
						"",
						[],
						-1,
						0, 
					);
					try {
						const success = await newIntent.fetchFirebase(userId, taskIdx, intentId);
						if (success) {
							runInAction(() => {
								this.intents.push(newIntent);
							});
						}
					} catch (error) {
						console.log(error);
					}
				}

				resolve();
			})).catch((error) => {
				reject("domain fetch error: " + error.message);
			});
		});
	}

	domainStoreConverter = {
		toFirestore: function(domainStore) {
			const data = {
				in_mainVideos: [],
				projectMetadata: {
					...toJS(domainStore.projectMetadata)
				},
				intents: [],
				curIntentPos: domainStore.curIntentPos,
			};
			for (let video of domainStore.in_mainVideos) {
				//const convertedVideo = video.videoStateConverter.toFirestore(video);
				data.in_mainVideos.push(video.commonState.id);
			}
			for (let intent of domainStore.intents) {
				//const convertedIntent = intent.intentStateConverter.toFirestore(intent);
				data.intents.push(intent.id);
			}
			//console.log("to", data);
			return data;
		},
		fromFirestore: function(snapshot, options) {
			const data = snapshot.data(options);
			//console.log("from", data);
			return data;
		}	
	};
	
}

export default DomainStore;
