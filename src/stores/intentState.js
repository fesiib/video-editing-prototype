import { makeAutoObservable } from "mobx";

import EditState from "./objects/editState";

import { randomUUID } from "../utilities/genericUtilities";

class IntentState {
    textCommand = "";
	sketchCommand = null;
	trackId = 0;
	activeEdits = [];
	editOperationIdx = -1;
	id = "";

    constructor(domainStore, textCommand, sketchCommand, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.textCommand = textCommand;
		this.sketchCommand = sketchCommand;
		this.editOperationIdx = -1;
		this.activeEdits = [];
		this.id = `intent-${randomUUID()}`;
		this.trackId = trackId;
    }

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
	}

	setEditOperationIdx(newIdx) {
		this.domainStore.rootStore.resetTempState();
		if (newIdx === -1) {
			this.editOperationIdx = -1;
			return;
		}
		if (!this.domainStore.editOperations[newIdx].supported) {
			return;
		}
		this.editOperationIdx = newIdx;
		//conversion between types should happen
	}

	addActiveEdit(first, second) {
		const start = Math.min(first, second);
		const finish = Math.max(first, second);
		let newEdit = new EditState(this.domainStore, this, `edit-${this.activeEdits.length}`, 0);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
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

	getObjectById(id) {
		return this.activeEdits.find((edit) => edit.commonState.id === id);
	}
	
	get allExcludedIds() {
		let result = [];
		for (let edit of this.activeEdits) {
			result.push(...edit.excludedIds);
		}
		return result;
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
		if (this.editOperationIdx === -1) {
			return null;
		}
		return this.domainStore.editOperations[this.editOperationIdx];
	}
}

export default IntentState;
