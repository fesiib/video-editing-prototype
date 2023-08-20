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

	editOperations = [
		{
			title: "Text",
			icon: null,
			supported: true,
		},
		{
			title: "Image",
			icon: null,
			supported: true,
		},
		{
			title: "Shape",
			icon: null,
			supported: false,
		},
		{
			title: "Cut",
			icon: null,
			supported: false,
		},
		{
			title: "Crop",
			icon: null,
			supported: true,
		},
		{
			title: "Zoom",
			icon: null,
			supported: false,
		},
		{
			title: "Blur",
			icon: null,
			supported: false,
		},
	];

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
		],
		range: [
			"background.alpha",
		],
		number: [
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
		const excludedIds = this.curIntent.allExcludedIds;
		let newMainVideos = []
		let newTexts = [];
		let newImages = [];
		let newShapes = [];
		for (let video of this.in_mainVideos) {
			if (excludedIds.findIndex((excludedId) => excludedId === video.commonState.id) === -1) {
				newMainVideos.push(video);
			}
		}
		for (let text of this.in_texts) {
			if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
				newTexts.push(text);
			}
		}
		for (let image of this.in_images) {
			if (excludedIds.findIndex((excludedId) => excludedId === image.commonState.id) === -1) {
				newImages.push(image);
			}
		}
		for (let shape of this.in_shapes) {
			if (excludedIds.findIndex((excludedId) => excludedId === shape.commonState.id) === -1) {
				newShapes.push(shape);
			}
		}
		for (let edit of this.curIntent.activeEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Text") {
				this.in_texts.push(edit);
			}
			if (this.curIntent.editOperation.title === "Image") {
				this.in_images.push(edit);
			}
			if (this.curIntent.editOperation.title === "Shape") {
				this.in_shapes.push(edit);
			}
			for (let object of edit.adjustedVideos) {
				newMainVideos.push(object);
			}
		}
		this.in_mainVideos = newMainVideos;
		this.in_texts = newTexts;
		this.in_images = newImages;
		this.in_shapes = newShapes;
		this.curIntentPos = this.intents.length;
		this.intents.push(
			new IntentState(this, "", "todo", 0)
		);
		this.rootStore.resetTempState();
	}

	cancelIntent() {
		this.intents.pop();
		this.intents.push(
			new IntentState(this, "", "todo", 0)
		);
		this.rootStore.resetTempState();
	}

    get transcripts() {
        let transcript = [];
        for (let video of this.videos) {
            transcript = [...transcript, ...video.adjustedTranscript];
        }
        transcript.sort((p1, p2) => p1.start - p2.start);
        return transcript;
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
		let result = [];
		const excludedIds = this.curIntent.allExcludedIds;
		for (let video of this.in_mainVideos) {
			if (excludedIds.findIndex((excludedId) => excludedId === video.commonState.id) === -1) {
				result.push(video);
			}
		}
		for (let edit of this.curIntent.activeEdits) {
			for (let object of edit.adjustedVideos) {
				result.push(object);
			}
		}
		return result;
	}

	get texts() {
		let result = [];
		const excludedIds = this.curIntent.allExcludedIds;
		for (let text of this.in_texts) {
			if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
				result.push(text);
			}
		}
		for (let edit of this.curIntent.activeEdits) {
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
		const excludedIds = this.curIntent.allExcludedIds;
		for (let text of this.in_images) {
			if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
				result.push(text);
			}
		}
		for (let edit of this.curIntent.activeEdits) {
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
		const excludedIds = this.curIntent.allExcludedIds;
		for (let text of this.in_shapes) {
			if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
				result.push(text);
			}
		}
		for (let edit of this.curIntent.activeEdits) {
			if (this.curIntent.editOperation === null) {
				continue;
			}
			if (this.curIntent.editOperation.title === "Shape") {
				result.push(edit);
			}
		}
		return result;
	}

	get curIntent() {
		return this.intents[this.curIntentPos];
	}
}

export default DomainStore;
