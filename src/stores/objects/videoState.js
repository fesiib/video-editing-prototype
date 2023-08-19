import { makeAutoObservable } from "mobx";

import CommonState from "./commonState";

import { randomUUID } from "../../utilities/genericUtilities";

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
	videoLink = null;
    source = null;
    transcript = [];
	moments = [];
	videoMetadata = {};
    highLabel = "None";
    lowLabel = "misc";

    // {text: "", start: ""} start is relative to video
    constructor(domainStore, videoLink, trackId, processLink=false) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.commonState = new CommonState(domainStore, this, "video-" + randomUUID(), trackId);
        this.domainStore = domainStore;
        this.videoLink = videoLink;
        this.transcript = [];
		this.moments = [];
		this.videoMetadata = {};
		if (processLink) {
			this.processVideoLink();
		}
    }

	getDeepCopy() {
		const video = new VideoState(
            this.domainStore,
            this.videoLink,
            this.commonState.trackId
        );
		video.source = this.source;
		video.transcript = [...this.transcript];
		video.moments = [...this.moments];
		video.videoMetadata = {
			...this.videoMetadata,
		}
		video.commonState.setMetadata(this.commonState.metadata);
		video.highLabel = this.highLabel;
		video.lowLabel = this.lowLabel;
		return video;
	}

    setVideoLink(videoLink) {
        this.videoLink = videoLink;
		this.source = false;
        this.commonState.processing = true;
        this.transcript = [];
		this.moments = [];
		this.videoMetadata = {};
		this.processVideoLink();
    }

	setTranscript(transcript) {
		this.transcript = [...transcript];
	}
	
	setMoments(moments) {
		this.moments = [...moments];
	}

    processVideoLink() {
		const requestCfg = REQUEST_TYPES.youtubeLink;
		console.log("processing -> ", this.videoLink);
        axios.post(requestCfg.serverAddr + requestCfg.route, {
            videoLink: this.videoLink,
        }).then(this.processVideoLinkSuccess, this.processVideoLinkFailure);
    }

	processVideoLinkSuccess(response) {
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
	}
	
	processVideoLinkFailure(error) {
		console.log(error);
	}

	splitVideo(offsetTimestamp) {
		const { 
			left: leftVideo,
			right: rightVideo,
		} = this.commonState.splitObject(offsetTimestamp);

        const nativeTimestamp = this.commonState.offsetToNative(offsetTimestamp);

        let rightTranscript = [];
        let leftTranscript = [];

        for (let script of this.transcript) {
            if (script.finish <= nativeTimestamp) {
                leftTranscript.push(script);
            } else {
                if (script.start >= nativeTimestamp) {
                    rightTranscript.push(script);
                } else if (script.finish - script.start > 0) {
                    const proportionOfText =
                        (nativeTimestamp - script.start) / (script.finish - script.start);
                    let textMiddle = Math.round(proportionOfText * script.text.length);
                    while (textMiddle < script.text.length && script.text[textMiddle] !== " ") {
                        textMiddle += 1;
                    }
                    leftTranscript.push({
                        text: script.text.slice(0, textMiddle),
                        start: script.start,
                        finish: nativeTimestamp,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                    rightTranscript.push({
                        text: script.text.slice(textMiddle + 1),
                        start: nativeTimestamp,
                        finish: script.finish,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                }
            }
        }

        rightVideo.setTranscript(rightTranscript);
        leftVideo.setTranscript(leftTranscript);
		return {
			leftVideo,
			rightVideo,
		};
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
				video: this,
            });
        }
        return adjusted;
    }

	get spatialParameters() {
		return {
			x: this.commonState.x,
			y: this.commonState.y,
			z: this.commonState.z,
			width: this.commonState.width,
			height: this.commonState.height,
			scaleX: this.commonState.scaleX,
			scaleY: this.commonState.scaleY,
			rotation: this.commonState.rotation,
		}
	}

	get temporalParameters() {
		return {
			start: this.commonState.start,
			finish: this.commonState.finish,
			duration: this.commonState.duration,
			offset: this.commonState.offset,
			speed: this.commonState.speed,
		};
	}

	get customParameters() {
		return {
			source: this.source,
		};
	}

	get metaParameters() {
		return {
			spatial: this.spatialParameters,
			temporal: this.temporalParameters,
			custom: this.customParameters,
		};
	}
}

export default VideoState;
