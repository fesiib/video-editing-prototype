import { makeAutoObservable } from "mobx";
import CommonState from "./commonState";

import axios from 'axios'

const ADDR = "http://localhost:7777/"

const REQUEST_TYPES = {
    youtubeLink: {
        serverAddr: ADDR,
        route: "process_youtube_link"
    },
	displayVideo: {
		serverAddr: ADDR,
		route: "display_video",
	}
};

function formatVTTtime(str_time) {
	let parts = str_time.split(":");
	parts.reverse();

	let seconds = 1;
	let result = 0;
	for (let single of parts) {
		result += seconds * parseFloat(single);
		seconds *= 60;
	}
	return result;
}

class VideoState {
    source = null;
    transcript = [];
	moments = [];
	videoMetadata = {};
    highLabel = "None";
    lowLabel = "misc";
	processedLink = false;

    // {text: "", start: ""} start is relative to video
    constructor(domainStore, source, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.commonState = new CommonState(domainStore, id, trackId);
        this.domainStore = domainStore;
        this.source = source;
        this.transcript = [];
		this.moments = [];
		this.videoMetadata = [];
		this.processSource();
    }

    setSource(source) {
        this.source = source;
        this.commonState.processing = true;
		this.processedLink = false;
        this.transcript = [];
		this.moments = [];
		this.videoMetadata = {};
		this.processSource();
    }

    processSource() {
		if (this.processedLink === true) {
			return;
		}
		this.processedLink = true;
        const requestCfg = REQUEST_TYPES.youtubeLink;
		console.log("here -> ", this.source);
        axios.post(requestCfg.serverAddr + requestCfg.route, {
            videoLink: this.source,
        }).then( (response) => {
            console.log(response);
            if (response.data.status === "error") {
                alert("Could not process the youtube link")
                return;
            }
			this.transcript = [];
			for (let single of response.data.transcript) {
				this.transcript.push({
					text: single.text,
					start: formatVTTtime(single.start),
					finish: formatVTTtime(single.finish),
					lowLabel: this.lowLabel,
					highLabel: this.highLabel,	
				});
			}
            this.moments = response.data.moments;
			this.videoMetadata = response.data.metadata;
			this.source = ADDR + response.data.source;
			console.log(this.source);
			this.commonState.setMetadata({
				thumbnails: [
					this.commonState.id,
					"misc",
					"None",
				],
				offset: 0,
				start: 0,
				finish: this.videoMetadata.duration,
			});
        }).catch((reason) => {
            console.log(reason);
        });
    }

    get adjustedTranscript() {
        const adjusted = [];
        for (let single of this.transcript) {
            const start = single.start - this.commonState.start + this.commonState.offset;
            const finish = single.finish - this.commonState.start + this.commonState.offset;
            adjusted.push({
                text: single.text,
                start: start,
                finish: finish,
                lowLabel: single.lowLabel,
                highLabel: single.highLabel,
            });
        }
        return adjusted;
    }
}

export default VideoState;
