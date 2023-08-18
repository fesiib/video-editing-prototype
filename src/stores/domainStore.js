import { makeAutoObservable } from "mobx";

import VideoState from "./videoState";
import TextState from "./textState";
import ImageState from "./imageState";
import ShapeState from "./shapeState";
import IntentState from "./intentState";
import EditState from "./editState";

class DomainStore {
	in_mainVideos = [];
	in_texts = [];
	in_images = [];
	in_shapes = [];
	
	activeEdits = [];
	
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

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;

		this.in_mainVideos = [];
		this.in_texts = [];
		this.in_images = [];
		this.in_shapes = [];

		this.activeEdits = [];
        this.intents = [
				new IntentState(this, "", "todo", 0, 0)
		];
		this.curIntentPos = 0;
    }

    splitVideo(originalVideo, offsetTimestamp) {
        const nativeTimestamp = originalVideo.commonState.offsetToNative(offsetTimestamp);
        const video = originalVideo.getDeepCopy();

        video.commonState.setMetadata({
            offset: offsetTimestamp,
            start: nativeTimestamp,
        });
        originalVideo.commonState.setMetadata({
            finish: nativeTimestamp,
        });

		console.log(video.commonState.id, originalVideo.commonState.id);
        let videoTranscript = [];
        let originalVideoTranscript = [];

        for (let script of originalVideo.transcript) {
            if (script.finish <= nativeTimestamp) {
                originalVideoTranscript.push(script);
            } else {
                if (script.start >= nativeTimestamp) {
                    videoTranscript.push(script);
                } else if (script.finish - script.start > 0) {
                    const proportionOfText =
                        (nativeTimestamp - script.start) / (script.finish - script.start);
                    let textMiddle = Math.round(proportionOfText * script.text.length);
                    while (textMiddle < script.text.length && script.text[textMiddle] !== " ") {
                        textMiddle += 1;
                    }
                    originalVideoTranscript.push({
                        text: script.text.slice(0, textMiddle),
                        start: script.start,
                        finish: nativeTimestamp,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                    videoTranscript.push({
                        text: script.text.slice(textMiddle + 1),
                        start: nativeTimestamp,
                        finish: script.finish,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                }
            }
        }

        video.setTranscript(videoTranscript);
        originalVideo.setTranscript(originalVideoTranscript);

		this.in_mainVideos = [...this.in_mainVideos, video];
    }

	confirmIntent() {
		const excludedIds = this.allExcludedIds;
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
		for (let edit of this.activeEdits) {
			for (let object of edit.adjustedObjects) {
				if (object instanceof VideoState) {
					newMainVideos.push(object);
				}
				if (object instanceof TextState) {
					newTexts.push(object);
				}
				if (object instanceof ImageState) {
					newImages.push(object);
				}
				if (object instanceof ShapeState) {
					newShapes.push(object);
				}
			}
		}
		this.in_mainVideos = newMainVideos;
		this.in_texts = newTexts;
		this.in_images = newImages;
		this.in_shapes = newShapes;
		this.activeEdits = [];
		this.curIntentPos = this.intents.length;
		this.intents.push(new IntentState(this, "", "todo", 0, 0));
	}

	cancelIntent() {
		this.activeEdits = [];
		this.intents.pop();
		this.intetnts.push(new IntentState(this, "", "todo", 0, 0));
	}

	addActiveEdit(first, second) {
		const start = Math.min(first, second);
		const finish = Math.max(first, second);
		let newEdit = new EditState(this, "newEdit", `edit-${this.intents.length}-${this.activeEdits.length}`, 0);
		newEdit.commonState.setMetadata({
			duration: this.rootStore.uiStore.timelineConst.trackMaxDuration,
			start: start,
			finish: finish, 
			offset: start,
		});
		this.activeEdits.push(newEdit);
	}

	deleteEdits(selectedIds) {
		this.activeEdits = this.activeEdits.filter((edit) => {
            const isSelected = selectedIds.includes(edit.commonState.id);
            console.log(isSelected);
            return !isSelected;
        });
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
		const excludedIds = this.allExcludedIds;
		for (let video of this.in_mainVideos) {
			if (excludedIds.findIndex((excludedId) => excludedId === video.commonState.id) === -1) {
				result.push(video);
			}
		}
		for (let edit of this.activeEdits) {
			for (let object of edit.adjustedObjects) {
				if (object instanceof VideoState) {
					result.push(object);
				}
			}
		}
		return result;
	}

	get texts() {
		let result = [];
		const excludedIds = this.allExcludedIds;
		for (let text of this.in_texts) {
			if (excludedIds.findIndex((excludedId) => excludedId === text.commonState.id) === -1) {
				result.push(text);
			}
		}
		for (let edit of this.activeEdits) {
			for (let object of edit.adjustedObjects) {
				if (object instanceof TextState) {
					result.push(object);
				}
			}
		}
		return result;
	}

	get images() {
		return [];
	}

	get shapes() {
		return [];
	}

	get edits() {
		return this.activeEdits;
	}

	get allExcludedIds() {
		let result = [];
		for (let edit of this.activeEdits) {
			result.push(...edit.excludedIds);
		}
		return result;
	}
}

export default DomainStore;
