import { makeAutoObservable } from "mobx";

class IntentState {
    textCommand = "";
	sketchCommand = null;
	trackId = 0;

    constructor(domainStore, textCommand, sketchCommand, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.textCommand = textCommand;
		this.sketchCommand = sketchCommand;
		this.id = id;
		this.trackId = trackId;
    }

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
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
}

export default IntentState;
