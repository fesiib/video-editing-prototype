import { makeAutoObservable } from "mobx";

import EditState from "./objects/editState";

import { randomUUID } from "../utilities/genericUtilities";

class IntentState {
    textCommand = "";
	sketchCommand = null;
	trackId = 0;
	activeEdits = [];
	editOperationKey = "";
	id = "";

    constructor(domainStore, textCommand, sketchCommand, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.textCommand = textCommand;
		this.sketchCommand = sketchCommand;
		this.editOperationKey = "Text";
		this.activeEdits = [];
		this.id = `intent-${randomUUID()}`;
		this.trackId = trackId;
		const edit = this.addActiveEdit(0, 100);
    }

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
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
		let newEdit = new EditState(this.domainStore, this, 0);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish, 
			offset: start,
		});
		this.activeEdits.push(newEdit);
		return this.activeEdits[this.activeEdits.length - 1];
	}

	deleteEdits(selectedIds) {
		this.activeEdits = this.activeEdits.filter((edit) => {
            const isSelected = selectedIds.includes(edit.commonState.id);
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
		if (this.editOperationKey === "") {
			return null;
		}
		return this.domainStore.editOperations[this.editOperationKey];
	}
}

export default IntentState;
