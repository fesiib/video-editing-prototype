import { makeAutoObservable } from "mobx";

class IntentState {
    textCommand = "";
	selectedPeriods = [];
	sketchCommand = null;
	trackId = 0;

    constructor(domainStore, textCommand, selectedPeriods, sketchCommand, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.textCommand = textCommand;
		this.selectedPeriods = selectedPeriods;
		this.sketchCommand = sketchCommand;
		this.id = id;
		this.trackId = trackId;
    }

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setSelectedPeriods(selectedPeriods) {
		//example: {video, start, finish}
		this.selectedPeriods = selectedPeriods;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
	}

	selectPeriod(video, adjustedStart, adjustedFinish) {
		const start = adjustedStart + video.commonState.start - video.commonState.offset;
		const finish = adjustedFinish + video.commonState.start - video.commonState.offset;
		this.selectPeriods.push({
			video,
			start,
			finish,
		});
	}

	get selectedTranscript() {
		let result = [];
		for (let selectedPeriod of this.selectedPeriods) {
			const video = selectedPeriod.video;
			const start = selectedPeriod.start;
			const finish = selectedPeriod.finish;
			for (let single of video.transcript) {
				if ((start <= single.finish && finish >= single.finish)
					|| (finish >= single.start && start <= single.start)) {
					result.push(single);
				}
			}
		}
		return result;
	}
}

export default IntentState;
