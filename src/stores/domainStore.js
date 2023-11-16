import { action, makeAutoObservable, runInAction, toJS } from "mobx";

import EditState from "./objects/editState";
import TabState from "./tabState";
import VideoState from "./objects/videoState";

import { firestore } from "../services/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

import { requestSuggestions, requestSuggestionsSplit, requestSummary } from "../services/pipeline";

import { sliceTextArray } from "../utilities/genericUtilities";
import BubbleState from "./objects/bubbleState";

class DomainStore {
	SYSTEM_ERROR_MESSAGE() {
		return "Error occured! Please try again!";
	}

	SYSTEM_PARSER_MESSAGE() {
		return "Parsing Results are: "
	}

	SYSTEM_TEMPORAL_MESSAGE(start, finish) {
		return `${this.curTab.editOperation.title} edit from ${start} to ${finish}`;
	}

	SYSTEM_SUMMARY_MESSAGE(numEdits) {
		return `Suggested ${numEdits} edits of type ${this.curTab.editOperation.title}!`;
	}

	
	domainDoc = "domain";

	processingRequest = false;

	in_mainVideos = [];

	// new
	tabs = [];
	curTabPos = 0;

    projectMetadata = {
        projectId: "test",
        title: "TEST",
        fps: 25,
        width: 854,
        height: 480, //720p
        duration: 10, // seconds
        trackCnt: 1,
		totalTabsCnt: 0,
    };

	bubbleTypes = {
		systemMessage: "systemMessage",
		userCommand: "userCommand",
		parsingResult: "parsingResult",
		edit: "edit",
		summaryMessage: "summaryMessage",
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
		time: [
			"start",
			"finish",
			"duration",
		],
		number: [
			"zoomDurationStart",
			"zoomDurationEnd",
			"star.numPoints",
			"star.innerRadius",
			"star.outerRadius",
			"circle.radiusX",
			"circle.radiusY",
			"stroke.width",
			"style.fontSize",
			"x",
			"y",
			"z",
			"width",
			"height",
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
		"finish": "End",
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
		"zoomDurationStart": "ZoomIn Start",
		"zoomDurationEnd": "ZoomOut End",
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
		//"source",
		//"searchQuery",
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

		this.projectMetadata.totalTabsCnt = 1;

		this.tabs = [
			new TabState(this, this.projectMetadata.totalTabsCnt, "", [], -1, 0),
		];
		this.curTabPos = 0;
		this.processingRequest = false;
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
			totalTabsCnt: 1,
		};

		this.tabs = [
			new TabState(this, this.projectMetadata.totalTabsCnt, "", [], -1, 0),
		];
		this.curTabPos = 0;
	}

	addTab() {
		this.curTabPos = this.tabs.length;
		this.projectMetadata.totalTabsCnt += 1;
		this.tabs.push(
			new TabState(this, this.projectMetadata.totalTabsCnt, "", [], -1, 0)
		);
		this.rootStore.resetTempState();
	}

	deleteTab(tabPos) {
		if (tabPos >= this.tabs.length || tabPos < 0) {
			return;
		}
		this.tabs = this.tabs.filter((tab, idx) => idx !== tabPos);
		this.tabs = this.tabs.map((tab, idx) => {
			if (idx < tabPos) {
				return tab;
			}
			for (let edit of tab.activeEdits) {
				edit.commonState.setMetadata({
					z: idx + 1,
				});
			}
			for (let bubble of tab.systemBubbles) {
				if (bubble.edit !== null) {
					bubble.edit.commonState.setMetadata({
						z: idx + 1,
					});
				}
			}
			return tab;
		});
		this.curTabPos = this.tabs.length - 1;
		if (this.curTabPos < 0) {
			this.addTab();
		}
		this.rootStore.resetTempState();
	}

	moveTab(tabPos, newPos) {
		console.log("moving", tabPos, newPos);
	}

	copyTabToCurrent(tabPos) {
		if (tabPos >= this.tabs.length || tabPos < 0) {
			return;
		}
		const deepCopy = this.tabs[tabPos].getDeepCopy();
		deepCopy.idx = this.tabs[this.curTabPos].idx;
		this.tabs[this.curTabPos] = deepCopy;
		for (let edit of deepCopy.activeEdits) {
			edit.commonState.setMetadata({
				z: this.curTabPos + 1,
			});
		}
		for (let bubble of deepCopy.systemBubbles) {
			if (bubble.edit !== null) {				
				bubble.commonState.setMetadata({
					z: this.curTabPos + 1,
				});
			}
		}
		this.rootStore.resetTempState();
	}

	duplicateTab(tabPos) {
		if (tabPos >= this.tabs.length || tabPos < 0) {
			return;
		}
		const deepCopy = this.tabs[tabPos].getDeepCopy();
		this.curTabPos = this.tabs.length;
		this.projectMetadata.totalTabsCnt += 1;
		deepCopy.idx = this.projectMetadata.totalTabsCnt;
		this.tabs.push(deepCopy);
		for (let edit of deepCopy.activeEdits) {
			edit.commonState.setMetadata({
				z: this.curTabPos + 1,
			});
		}
		for (let bubble of deepCopy.systemBubbles) {
			if (bubble.edit !== null) {
				bubble.commonState.setMetadata({
					z: this.curTabPos + 1,
				});
			}
		}
		this.rootStore.resetTempState();
	}

	setCurTab(tabPos) {
		if (tabPos >= this.tabs.length || tabPos < 0) {
			return;
		}
		if (tabPos === this.curTabPos) {
			return;
		}
		this.curTabPos = tabPos;
		//TODO: fix scroll position
		this.rootStore.resetTempState();
	}

	processRequest(processingMode, segmentOfInterest) {
		if (this.processingRequest) {
			// TODO: stop previous
			return;
		}

		this.processingRequest = true;
		
		const isAddMore = processingMode === this.processingModes.addMore;
		
		if (!isAddMore) {

			const userCommandBubble = this.curTab.addBubble(
				new Date().getTime(),
				this.bubbleTypes.userCommand
			);
			userCommandBubble.setContent(this.curTab.textCommand);
		}

		// request
		// stage : parse -> temporal -> spatial -> edit
		const requestData = {
			videoId: "",
			projectMetadata: {},
			edits: [],
			curPlayPosition: this.rootStore.uiStore.timelineControls.playPosition,
			segmentOfInterest: segmentOfInterest,
			skippedSegments: [],
			requestParameters: {
				parsingResults: {},
			},
			editParameterOptions: toJS({ ...this.dropdownOptions }),
			editOperations: Object.keys(toJS(this.editOperations)),
		};
		requestData.videoId = toJS(this.projectMetadata.title);
		requestData.projectMetadata = toJS({
			...this.projectMetadata,
		});
		requestData.edits = [...this.curTab.activeEdits].map((edit) => {
			return toJS(edit.requestBody);
		});
		requestData.requestParameters = toJS({
			...requestData.requestParameters,
			...this.curTab.requestParameters,
			processingMode: processingMode,
		});


		requestData.skippedSegments = [
			...this.skippedParts, ...(
				isAddMore ? 
					this.curTab.systemBubbles.filter(
						(bubble) => bubble.type === this.bubbleTypes.edit && bubble.edit !== null
					).map(
						(bubble) => bubble.edit
					) : []
			)
		].map((edit) => {
			return {
				temporalParameters: {
					start: edit.commonState.offset,
					finish: edit.commonState.end,
				}
			};
		});

		const requestedTabPos = this.curTabPos;
		this.curTab.suggestedEdits = [];
		this.curTab.suggestedEditOpeartionKeys = [];

		console.log(requestData);

		// request summary
		requestSummary({
			input: requestData.requestParameters.text,
		}).then(action((responseData) => {
			this.setCurTab(requestedTabPos);
			if (responseData === null || responseData.summary === undefined) {
				console.log("no summary");
				this.processingRequest = false;
				const systemMessageBubble = this.curTab.addBubble(
					new Date().getTime(),
					this.bubbleTypes.systemMessage
				);
				systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
				return;
			}
			const summary = responseData.summary;
			this.curTab.setTitle(summary);
			console.log(summary);
			//parsing results
			requestSuggestionsSplit({
				stage: "parse",
				...requestData,
			}).then(action((responseData) => {
				this.setCurTab(requestedTabPos);
				if (responseData === null || responseData.parsingResults === undefined) {
					console.log("no parsing results");
					this.processingRequest = false;
					const systemMessageBubble = this.curTab.addBubble(
						new Date().getTime(),
						this.bubbleTypes.systemMessage
					);
					systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
					return;
				}
				const relevantText = responseData.relevantText;
				const parsingResults = responseData.parsingResults;
				const suggestedEditOperationKeys = responseData.editOperations;

				if (!isAddMore) {
					const requestResultBubble = this.curTab.addBubble(
						new Date().getTime(),
						this.bubbleTypes.parsingResult
					);
					requestResultBubble.setContent(this.SYSTEM_PARSER_MESSAGE());
					requestResultBubble.setParsingResult(
						//TODO: requestData.requestParameters.text,
						"Whenever the person engages with the screen, draw a sparkling mark near his head",
						relevantText["spatial"].map((item) => [item.offset, item.offset + item.reference.length]),
						relevantText["temporal"].map((item) => [item.offset, item.offset + item.reference.length]),
						relevantText["edit"].map((item) => [item.offset, item.offset + item.reference.length]),
						Object.values(relevantText["parameters"]).flat().map((item) => [item.offset, item.offset + item.reference.length]),
					);
					this.curTab.setSuggestedEditOperationKeys(suggestedEditOperationKeys);
					if (suggestedEditOperationKeys.length > 0) {
						this.curTab.setEditOperationKey(suggestedEditOperationKeys[0]);
					}
				}
				// temporal
				for (let temporal of parsingResults.temporal_references) {
					requestData.requestParameters.parsingResults = {
						...parsingResults,
						temporal_references: [temporal],
					};
					requestSuggestionsSplit({
						stage: "temporal",
						...requestData,
					}).then(action((responseData) => {
						this.setCurTab(requestedTabPos);
						if (responseData === null || responseData.edits === undefined) {
							console.log("no temporal edits");
							this.processingRequest = false;
							const systemMessageBubble = this.curTab.addBubble(
								new Date().getTime(),
								this.bubbleTypes.systemMessage
							);
							systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
							return;
						}
						const edits = responseData.edits;
						let editPromises = [];
						for (let edit of edits){
							const newEditBubble = this.curTab.addBubble(new Date().getTime(), this.bubbleTypes.edit);
							newEditBubble.edit.commonState.setMetadata({
								duration: this.projectMetadata.duration,
								z: this.curTab.tabPos + 1,
							});
							newEditBubble.edit.suggestionSource = {
								temporal: [temporal.reference],
								spatial: relevantText.spatial,
								custom: relevantText.parameters,
								edit: relevantText.edit,
							};
							newEditBubble.edit.setResponseBody({
								...edit,
							});
							editPromises.push(new Promise(action((resolve, reject) => {
								requestSuggestionsSplit({
									stage: "spatial",
									...requestData,
									edits: [toJS(newEditBubble.edit.requestBody)],
								}).then(action((responseData) => {
									this.setCurTab(requestedTabPos);
									if (responseData === null || responseData.edits === undefined) {
										newEditBubble.edit.setContent(this.SYSTEM_ERROR_MESSAGE());
										reject("no spatial parameters");
									}
									const editWithSpatial = responseData.edits[0];
									newEditBubble.edit.setResponseBody({
										...editWithSpatial,
									});
									requestSuggestionsSplit({
										stage: "edit",
										...requestData,
										edits: [toJS(newEditBubble.edit.requestBody)],
									}).then(action((responseData) => {
										this.setCurTab(requestedTabPos);
										if (responseData === null || responseData.edits === undefined) {
											newEditBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
											reject("no edit parameters");
										}
										newEditBubble.setContent(this.SYSTEM_TEMPORAL_MESSAGE(
											newEditBubble.edit.commonState.offset,
											newEditBubble.edit.commonState.end,
										));
										const editWithEdit = responseData.edits[0];
										newEditBubble.edit.setResponseBody({
											...editWithEdit,
										});
										newEditBubble.completedProcessing();
										resolve("Successful");
									})).catch(action((error) => {
										console.log("cannot retrieve the edit parameters: ", error);
										this.setCurTab(requestedTabPos);
										newEditBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
										reject(error);
									}));
								})).catch(action((error) => {
									console.log("cannot retrieve the spatial results: ", error);
									this.setCurTab(requestedTabPos);
									newEditBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
									reject(error);
								}));
							})));
						}
						Promise.all(editPromises).then(action(() => {
							this.setCurTab(requestedTabPos);
							
							const summaryMessageBubble = this.curTab.addBubble(
								new Date().getTime(),
								this.bubbleTypes.summaryMessage
							);
							summaryMessageBubble.setContent(this.SYSTEM_SUMMARY_MESSAGE(
								editPromises.length,
							));

							this.processingRequest = false;
						})).catch(action((error) => {
							console.log("cannot retrieve the edit parameters: ", error);
							this.setCurTab(requestedTabPos);
							this.processingRequest = false;
							const systemMessageBubble = this.curTab.addBubble(
								new Date().getTime(),
								this.bubbleTypes.systemMessage
							);
							systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
						}));
					})).catch(action((error) => {
						console.log("cannot retrieve the temporal results: ", error);
						this.setCurTab(requestedTabPos);
						this.processingRequest = false;
						const systemMessageBubble = this.curTab.addBubble(
							new Date().getTime(),
							this.bubbleTypes.systemMessage
						);
						systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
					}));
				}
			})).catch(action((error) => {
				console.log("cannot retrieve the parsing results: ", error);
				this.setCurTab(requestedTabPos);
				this.processingRequest = false;
				const systemMessageBubble = this.curTab.addBubble(
					new Date().getTime(),
					this.bubbleTypes.systemMessage
				);
				systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
			}));
		})).catch(action((error) => {
			console.log("cannot retrieve the summary: ", error);
			this.setCurTab(requestedTabPos);
			this.processingRequest = false;
			const systemMessageBubble = this.curTab.addBubble(
				new Date().getTime(),
				this.bubbleTypes.systemMessage
			);
			systemMessageBubble.setContent(this.SYSTEM_ERROR_MESSAGE());
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
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Text") {
					result.push(edit);
				}
			}
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
		}
		return result;
	}

	get images() {
		let result = [];
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Image") {
					result.push(edit);
				}
			}	
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
		}
		
		return result;
	}

	get shapes() {
		let result = [];
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Shape") {
					result.push(edit);
				}
			}	
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
		}
		return result;
	}

	get skippedParts() {
		let result = [];
		for (let tab of this.tabs) {
			if (tab.id === this.curTab.id) {
				continue;
			}
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Cut") {
					result.push(edit);
				}
			}
		}
		return result;
	}

	get allSkippedParts() {
		let result = [];
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Cut") {
					result.push(edit);
				}
			}
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
		}
		return result;
	}

	get crops() {
		let result = [];
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Crop") {
					result.push(edit);
				}
			}
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
		}
		return result;
	}

	get zooms() {
		let result = [];
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Zoom") {
					result.push(edit);
				}
			}
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
		}
		return result;
	}

	get blurs() {
		let result = [];
		for (let tab of this.tabs) {
			for (let edit of tab.activeEdits) {
				if (tab.editOperation === null) {
					continue;
				}
				if (tab.editOperation.title === "Blur") {
					result.push(edit);
				}
			}
		}
		if (!this.rootStore.userStore.systemSetting) {
			return result;
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
		].filter((object) => object.parent.idx !== this.curTab.idx);
		objects.sort((a, b) => a.commonState.z - b.commonState.z);
		
		if (this.curTab.editOperation !== null) {
			if (!this.rootStore.userStore.systemSetting) {
				return [...objects, ...this.curTab.activeEdits];
			}	
			return [...objects, ...this.curTab.activeEdits, ...this.curTab.suggestedEdits];
		}
		return objects;
	}

	get curTab() {
		return this.tabs[this.curTabPos];
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
				let allTabPromises = [];
				for (let tab of this.tabs) {
					allTabPromises.push(tab.saveFirebase(userId, taskIdx));
				}		
				await Promise.all(allTabPromises);
			} catch (error) {
				reject("tabs save error: " + error);
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
				this.tabs = [];
				this.projectMetadata = {
					...data.projectMetadata,
				};
				this.curTabPos = data.curTabPos;
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
				
				for (let tabId of data.tabs) {
					const newTab = new TabState(
						this,
						0,
						"",
						[],
						-1,
						0, 
					);
					try {
						const success = await newTab.fetchFirebase(userId, taskIdx, tabId);
						if (success) {
							runInAction(() => {
								this.tabs.push(newTab);
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
				tabs: [],
				curTabPos: domainStore.curTabPos,
			};
			for (let video of domainStore.in_mainVideos) {
				data.in_mainVideos.push(video.commonState.id);
			}
			for (let tab of domainStore.tabs) {
				data.tabs.push(tab.id);
			}
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
