import { action, makeAutoObservable, runInAction, set, toJS } from "mobx";

import EditState from "./objects/editState";

import { randomUUID, sliceTextArray } from "../utilities/genericUtilities";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../services/firebase";

class TabState {
	trackId = 0;

	title = "Untitled";

	id = "";
	idx = 0;

	textCommand = "";
	sketchCommand = [];
	sketchPlayPosition = -1;
	
	systemBubbles = [];
	userBubbles = [];

	editOperationKey = "";
	activeEdits = [];
	
	processingMode = "from-scratch"; // from-scratch, add-more, adjust-selected

    constructor(domainStore, idx, textCommand, sketchCommand, sketchPlayPosition, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
		
		this.trackId = trackId;

		this.title = "Untitled";
		
		this.id = `intent-${randomUUID()}`;
		this.idx = idx;

		this.textCommand = textCommand;
		this.sketchCommand = [...sketchCommand];
		this.sketchPlayPosition = sketchPlayPosition;
        
		this.systemBubbles = [];
		this.userBubbles = [];

		this.editOperationKey = Object.keys(domainStore.editOperations)[0];
		this.activeEdits = [];
		
		this.processingMode = "from-scratch";
    }

	setTitle(title) {
		this.title = title;
	}
	setIdx(idx) {
		this.idx = idx;
	}
	setProcessingMode(mode) {
		this.processingMode = mode;
	}

	setEditOperationKey(key) {
		this.editOperationKey = key;
	}

	setTextCommand(text) {
		this.textCommand = text;
	}

	setSketchCommand(sketch) {
		this.sketchCommand = [...sketch];
	}

	setSketchPlayPosition(pos) {
		this.sketchPlayPosition = pos;
	}

	addActiveEdit(first, second) {
		const start = Math.min(first, second);
		const finish = Math.max(first, second);
		let newEdit = new EditState(this.domainStore, this, false, this.trackId);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish, 
			offset: start,
			z: this.intentPos + 1,
		});
		this.activeEdits.push(newEdit);
		newEdit.zoomParameters = {
			...newEdit.zoomParameters,
			zoomDurationStart: Math.max(3, newEdit.commonState.sceneDuration),
		}
		newEdit.zoomParameters = {
			...newEdit.zoomParameters,
			zoomDurationEnd: Math.max(3, newEdit.commonState.sceneDuration - newEdit.zoomParameters.zoomDurationStart),
		}
		return this.activeEdits[this.activeEdits.length - 1];
	}
	
	setActiveEdits(edits) {
		this.activeEdits = [...edits];
	}

	deleteEdits(selectedIds) {
		this.activeEdits = this.activeEdits.filter((edit) => {
            const isSelected = selectedIds.includes(edit.commonState.id);
            return !isSelected;
        });
		this.userBubbles = this.userBubbles.filter((bubble) => {
			const isSelected = selectedIds.includes(bubble.id);
			return !isSelected;
		});
		this.systemBubbles = this.systemBubbles.filter((bubble) => {
			const isSelected = selectedIds.includes(bubble.id);
			return !isSelected;
		});
		this.domainStore.rootStore.uiStore.selectTimelineObjects(
			this.domainStore.rootStore.uiStore.timelineControls.selectedTimelineItems.filter((item) => {
				return !selectedIds.includes(item?.commonState?.id);
			})
		); 
	}

	clearBubbles() {
		this.systemBubbles = [];
		this.userBubbles = [];
	}

	getDeepCopy() {
		systemBubbles = [];
		userBubbles = [];
		for (let bubble of this.systemBubbles) {
			systemBubbles.push(bubble.getDeepCopy());
		}
		for (let bubble of this.userBubbles) {
			userBubbles.push(bubble.getDeepCopy());
		}

		let newTab = new TabState(
			this.domainStore,
			this.idx,
			this.textCommand,
			this.sketchCommand,
			this.sketchPlayPosition,
			this.trackId,
		);
		newTab.title = this.title;
		newTab.userBubbles = userBubbles;
		newTab.systemBubbles = systemBubbles;
		newTab.editOperationKey = this.editOperationKey;
		newTab.activeEdits = this.activeEdits.slice(0).map((edit) => {
			const newEdit = edit.getDeepCopy();
			newEdit.tab = newTab;
			return newEdit;
		});
		newTab.processingMode = this.processingMode;
		return newTab;
	}

	addEditFromBubble(bubbleId) {
		const suggestedEdit = this.systemBubbles.find((bubble) => bubble.id === bubbleId);
		if (suggestedEdit === undefined) {
			return [];
		}
		const newEdit = suggestedEdit.getDeepCopy();
		newEdit.isSuggested = false;
		let deleteIds = [];
		let newEdits = [newEdit];
		for (let edit of this.activeEdits) {
			const left = Math.max(newEdit.commonState.offset, edit.commonState.offset);
			const right = Math.min(newEdit.commonState.end, edit.commonState.end);
			if (left < right) {
				if (left === edit.commonState.offset && right === edit.commonState.end) {
					deleteIds.push(edit.commonState.id);
				}
				else if (left === edit.commonState.offset) {
					edit.commonState.setMetadata({
						start: (right - edit.commonState.offset) + edit.commonState.start,
						offset: right,
					});
				}
				else if (right === edit.commonState.end) {
					edit.commonState.setMetadata({
						finish: (left - edit.commonState.offset) + edit.commonState.start,
					});
				}
				else {
					let editCopy = edit.getDeepCopy();
					editCopy.commonState.setMetadata({
						start: (right - edit.commonState.offset) + edit.commonState.start,
						offset: right,
					});
					edit.commonState.setMetadata({
						finish: (left - edit.commonState.offset) + edit.commonState.start,
					});
					newEdits.push(editCopy);
				}
			}
		}
		this.deleteEdits(deleteIds);
		this.activeEdits.push(...newEdits);
		return newEdits;
	}

	getObjectById(id) {
		const fromActive = this.activeEdits.find((edit) => edit.commonState.id === id);
		const fromUser = this.userBubbles.find((bubble) => bubble.id === id);
		const fromSystem = this.systemBubbles.find((bubble) => bubble.id === id);
		if (fromActive !== undefined) {
			return fromActive;
		}
		else if (fromUser !== undefined) {
			return fromUser;
		}
		else if (fromSystem !== undefined) {
			return fromSystem;
		}
		else {
			return null;
		}
	}

	getCanvasObjectById(id) {
		if (this.editOperationKey === "crop" || this.editOperationKey === "shape") {
			const realId = id.substring(3);
			return this.getObjectById(realId);
		}
		return this.getObjectById(id);
	}

	get tabPos() {
		return this.domainStore.tabs.findIndex((tab) => tab.id === this.id);
	}

	get activeObjectsVisibility() {
		const playPosition = this.domainStore.rootStore.uiStore.timelineControls.playPosition;
		let result = [];
		for (let edit of this.activeEdits) {
			result.push(edit.isVisible(playPosition));
		}
		return result;
	}

	get editOperation() {
		if (this.editOperationKey === "") {
			return null;
		}
	}

	get requestParameters() {
		return {
			processingMode: this.processingMode,
			hasText: this.textCommand !== "",
			hasSketch: this.sketchCommand.length > 0,
			text: this.textCommand,
			sketchRectangles: [...this.sketchCommand],
			sketchFrameTimestamp: this.sketchCommand.length > 0 ? this.sketchFrameTimestamp : -1,
			editOperation: this.editOperationKey,
		}
	}

	get processingAllowed() {
		return this.textCommand !== "" || (this.sketchCommand.length > 0 && this.sketchPlayPosition >= 0);
	}

}