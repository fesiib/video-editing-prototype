import { has, makeAutoObservable } from "mobx";

class IntentState {
    textCommand = "";
	selectedPeriodsPerVideo = {};
	sketchCommand = null;
	trackId = 0;

    constructor(domainStore, textCommand, selectedPeriodsPerVideo, sketchCommand, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.textCommand = textCommand;
		this.selectedPeriodsPerVideo = selectedPeriodsPerVideo;
		this.sketchCommand = sketchCommand;
		this.id = id;
		this.trackId = trackId;
    }

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setselectedPeriodsPerVideo(selectedPeriodsPerVideo) {
		//example: {video, start, finish}
		this.selectedPeriodsPerVideo = selectedPeriodsPerVideo;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
	}

	selectPeriod(video, adjustedStart, adjustedFinish) {
		const start = adjustedStart + video.commonState.start - video.commonState.offset;
		const finish = adjustedFinish + video.commonState.start - video.commonState.offset;
		let minStart = start;
		let maxFinish = finish;
		
		// let start = Math.floor(adjustedStart + video.commonState.start - video.commonState.offset);
		// let finish = Math.ceil(adjustedFinish + video.commonState.start - video.commonState.offset);
		if (Object.keys(this.selectedPeriodsPerVideo).includes(video.commonState.id) === false) {
			this.selectedPeriodsPerVideo[video.commonState.id] = [];
		}

		const curSelectedPeriods = this.selectedPeriodsPerVideo[video.commonState.id];
		let intersectedIdx = curSelectedPeriods.length;
		let intersectedCount = 0;
		curSelectedPeriods.forEach((period, idx) => {
			if (Math.max(start, period.start) < Math.min(finish, period.finish)) {
				intersectedIdx = Math.min(intersectedIdx, idx);
				intersectedCount++;
				minStart = Math.min(period.start, minStart);
				maxFinish = Math.max(period.finish, finish);
			}
			else if (period.start >= finish) {
				intersectedIdx = Math.min(intersectedIdx, idx);
			}
		});
		this.selectedPeriodsPerVideo[video.commonState.id].splice(intersectedIdx, intersectedCount, {
			video,
			start,
			finish,
		});
	}

	deselectPeriod(video, adjustedStart, adjustedFinish) {
		const start = adjustedStart + video.commonState.start - video.commonState.offset;
		const finish = adjustedFinish + video.commonState.start - video.commonState.offset;
		
		// let start = Math.floor(adjustedStart + video.commonState.start - video.commonState.offset);
		// let finish = Math.ceil(adjustedFinish + video.commonState.start - video.commonState.offset);
		if (Object.keys(this.selectedPeriodsPerVideo).includes(video.commonState.id) === false) {
			this.selectedPeriodsPerVideo[video.commonState.id] = [];
		}

		const curSelectedPeriods = this.selectedPeriodsPerVideo[video.commonState.id];
		let intersectedIdx = curSelectedPeriods.length;
		let newPeriods = [];
		let intersectedCount = 0;
		curSelectedPeriods.forEach((period, idx) => {
			if (Math.max(start, period.start) < Math.min(finish, period.finish)) {
				intersectedIdx = Math.min(intersectedIdx, idx);
				intersectedCount++;
 	 			if (start <= period.start) {
					if (finish < period.finish) {
						newPeriods.push({
							video: period.video,
							start: finish,
							finish: period.finish,
						});
					}
				}
				else {
					if (finish >= period.finish) {
						newPeriods.push({
							video: period.video,
							start: period.start,
							finish: start,
						});
					}
					else {
						newPeriods.push({
							video: period.video,
							start: period.start,
							finish: start,
						});
						newPeriods.push({
							video: period.video,
							start: finish,
							finish: period.finish,
						});
					}
				}
			}
		});
		this.selectedPeriodsPerVideo[video.commonState.id].splice(intersectedIdx, intersectedCount, ...newPeriods);
	}

	selectedTranscriptIndex(targetSingle) {
		const index = this.selectedTranscript.findIndex((item) => {
			if (
				item.start === targetSingle.start &&
				item.finish === targetSingle.finish &&
				item.text === targetSingle.text
			) {
				return true;
			}
			return false;
		});
		return index;
	}

	get selectedTranscript() {
		let result = [];
		for (let selectedPeriod of this.selectedPeriods) {
			const video = selectedPeriod.video;
			const start = selectedPeriod.start;
			const finish = selectedPeriod.finish;
			for (let single of video.transcript) {
				if (Math.max(single.start, start) < Math.min(single.finish, finish)) {
					result.push({
						...single,
						video,
					});
				}
			}
		}
		result.sort((p1, p2) => p1.start - p2.start);
		return result;
	}

	get selectedPeriods() {
		let result = [];
		Object.values(this.selectedPeriodsPerVideo).forEach((curSelectedPeriods) => {
			result.push(...curSelectedPeriods);
		});
		result.sort((p1, p2) => p1.start - p2.start);
		return result;
	}
}

export default IntentState;
