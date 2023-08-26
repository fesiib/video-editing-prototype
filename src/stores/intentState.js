import { makeAutoObservable, set } from "mobx";

import EditState from "./objects/editState";

import { randomUUID } from "../utilities/genericUtilities";

class IntentState {
    textCommand = "";
	sketchCommand = [];
	sketchPlayPosition = -1;
	trackId = 0;
	activeEdits = [];
	editOperationKey = "";
	id = "";
	idx = 0;
	
	considerEdits = true;
	suggestedEdits = [];

    constructor(domainStore, idx, textCommand, sketchCommand, sketchPlayPosition, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
		this.idx = idx;
        this.textCommand = textCommand;
		this.sketchCommand = sketchCommand;
		this.sketchPlayPosition = sketchPlayPosition;
		this.editOperationKey = "";
		this.activeEdits = [];
		this.suggestedEdits = [];
		this.id = `intent-${randomUUID()}`;
		this.trackId = trackId;
		this.considerEdits = true;
    }

	getDeepCopy() {
		let newIntent = new IntentState(
			this.domainStore,
			this.idx,
			this.textCommand,
			this.sketchCommand,
			this.sketchPlayPosition,
			this.trackId
		);
		newIntent.editOperationKey = this.editOperationKey;
		newIntent.activeEdits = this.activeEdits.slice(0).map((edit) => {
			const newEdit = edit.getDeepCopy();
			newEdit.intent = newIntent;
			return newEdit;
		});
		newIntent.suggestedEdits = this.suggestedEdits.slice(0).map((edit) => {
			const newEdit = edit.getDeepCopy();
			newEdit.intent = newIntent;
			return newEdit;
		});
		newIntent.considerEdits = this.considerEdits;
		return newIntent;
	}

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
	}

	setSketchPlayPosition(sketchPlayPosition) {
		this.sketchPlayPosition = sketchPlayPosition;
	}

	setEditOperationKey(newKey) {
		this.domainStore.rootStore.resetTempState();
		if (newKey === "") {
			this.editOperationKey = "";
			return;
		}
		if (!this.domainStore.editOperations[newKey].supported) {
			return;
		}
		this.editOperationKey = newKey;
		//conversion between types should happen
	}

	addActiveEdit(first, second) {
		const start = Math.min(first, second);
		const finish = Math.max(first, second);
		let newEdit = new EditState(this.domainStore, this, false, 0);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish, 
			offset: start,
			z: this.intentPos + 1,
		});
		this.activeEdits.push(newEdit);
		//this.activeEdits.sort((a, b) => a.commonState.offset - b.commonState.offset);
		return this.activeEdits[this.activeEdits.length - 1];
	}

	addRandomEdit(suggestion) {
		const maxEditDuration = 120;

		const edits = suggestion ? this.suggestedEdits : this.activeEdits;

		let start = Math.floor(Math.random() * maxEditDuration);
		let maxDuration = maxEditDuration;
		while (true) {
			let within = false;
			for (let edit of edits) {
				if (edit.commonState.offset <= start && edit.commonState.end > start) {
					within = true;
					break
				}
				if (edit.commonState.offset > start) {
					maxDuration = Math.min(edit.commonState.offset - start, maxDuration);
				}
			}
			if (within === true) {
				start = Math.floor(Math.random() * maxEditDuration);
				maxDuration = maxEditDuration
				continue;
			}
			break;
		}
		maxDuration = Math.min(maxDuration, 30);
		let finish = start + Math.floor(Math.random() * maxDuration);

		let x1 = Math.floor(Math.random() * this.domainStore.projectMetadata.width);
		let y1 = Math.floor(Math.random() * this.domainStore.projectMetadata.height);
		let x2 = Math.floor(Math.random() * this.domainStore.projectMetadata.width);
		let y2 = Math.floor(Math.random() * this.domainStore.projectMetadata.height);
		let x = Math.min(x1, x2);
		let y = Math.min(y1, y2);
		let width = Math.abs(x1 - x2);
		let height = Math.abs(y1 - y2);


		let newEdit = new EditState(this.domainStore, this, suggestion, 0);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish,
			offset: start,
			x: x,
			y: y,
			width: width,
			height: height,
			z: this.intentPos + 1,
		});
		if (suggestion) {
			this.suggestedEdits.push(newEdit);
			return this.suggestedEdits[this.suggestedEdits.length - 1];
		}
		this.activeEdits.push(newEdit);
		return this.activeEdits[this.activeEdits.length - 1];
	}

	deleteEdits(selectedIds) {
		this.activeEdits = this.activeEdits.filter((edit) => {
            const isSelected = selectedIds.includes(edit.commonState.id);
            return !isSelected;
        });
		this.suggestedEdits = this.suggestedEdits.filter((edit) => {
			const isSelected = selectedIds.includes(edit.commonState.id);
			return !isSelected;
		});
	}

	getObjectById(id) {
		return this.activeEdits.find((edit) => edit.commonState.id === id);
	}

	getCanvasObjectById(id) {
		if (this.editOperationKey === "crop") {
			const realId = id.substring(3);
			return this.getObjectById(realId);
		}
		return this.getObjectById(id);
	}

	get selectedPeriods() {
		return [];
	}
	get selectedTranscript() {
		return [];
	}
	get selectedEditOperation() {
		return [];
	}
	get selectedRectangle() {
		return [];
	}

	get editOperation() {
		if (this.editOperationKey === "") {
			return null;
		}
		return this.domainStore.editOperations[this.editOperationKey];
	}

	get intentPos() {
		return this.domainStore.intents.findIndex((intent) => intent.id === this.id);
	}

	get activeObjectsVisibility() {
		const playPosition = this.domainStore.rootStore.uiStore.timelineControls.playPosition;
		let result = [];
		for (let edit of this.activeEdits) {
			result.push(edit.isVisible(playPosition));
		}
		return result;
	}

	get requestParameters() {
		return {
			consdierEdits: this.considerEdits,
			hasText: this.textCommand !== "",
			hasSketch: this.sketchCommand.length > 0,
			text: this.textCommand,
			sketchRectangles: [...this.sketchCommand],
			sketchFrameTimestamp: this.sketchPlayPosition,
			editOperation: this.editOperationKey,
		}
	}
}

export default IntentState;
