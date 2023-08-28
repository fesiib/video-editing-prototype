import { action, makeAutoObservable } from "mobx";

import CommonState from "./commonState";

import { randomUUID } from "../../utilities/genericUtilities";

import axios from 'axios'
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";

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
	videoDoc = "videos";

	videoLink = null;
    source = null;
    transcript = [];
	moments = [];
	videoMetadata = {};
    highLabel = "None";
    lowLabel = "misc";

    // {text: "", start: ""} start is relative to video
    constructor(domainStore, parentList, videoLink, trackId, processLink=false) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.commonState = new CommonState(domainStore, this, "video-" + randomUUID(), trackId);
        this.domainStore = domainStore;
		this.parentList = parentList;
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
			this.parentList,
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
		//this.domainStore.projectMetadata.title = this.videoMetadata.id;
		this.domainStore.projectMetadata.title = "test";
		this.commonState.setMetadata({
			thumbnails: [
				"video",
				this.commonState.id,
			],
		});
	}
	
	processVideoLinkFailure(error) {
		console.log(error);
	}

	split(offsetTimestamp) {
		const { 
			left,
			right,
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

        right.setTranscript(rightTranscript);
        left.setTranscript(leftTranscript);
		return {
			left,
			right,
		};
    }

	replaceSelf(edits) {
		let newParentList = this.parentList.filter((video) => video.commonState.id !== this.commonState.id);
		newParentList.push(...edits);
		this.parentList = [...newParentList];
	}

	isVisible(playPosition) {
        return (this.commonState.offset <= playPosition &&
			this.commonState.end > playPosition);
	}

	get title() {
		return "Video";
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
			width: this.commonState.width,
			height: this.commonState.height,
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

	saveFirebase(userId, taskIdx) {
		const videoCollection = collection(firestore,
			this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.videoCollection);
		const videoId = this.commonState.id;
		const videoDoc = doc(videoCollection, videoId).withConverter(this.videoStateConverter);		
		return new Promise((resolve, reject) => {
			setDoc(videoDoc, this, {merge: false}).then(() => {
				//console.log(`video ${videoId} saved: `, videoId, userId, this.domainStore.rootStore.videoCollection);
				resolve();
			}).catch((error) => {
				reject(`video ${videoId} save error: ` + error.message);
			});
		});
	}

	fetchFirebase(userId, taskIdx, videoId) {
		const videoCollection = collection(firestore,
			this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.videoCollection);
		const videoDoc = doc(videoCollection, videoId).withConverter(this.videoStateConverter);	
		return new Promise((resolve, reject) => {
			getDoc(videoDoc).then(action((fetchedVideoState) => {
				//console.log("fetched video", fetchedVideoState);
				const data = fetchedVideoState.exists() ? fetchedVideoState.data() : null;
				if (data === null || data.commonState === undefined) {
					//TODO: maybe reset video state
					resolve(false);
				}
				
				this.source = data.source;
				this.transcript = [];
				this.moments = [];
				this.videoMetadata = {};
				this.commonState = new CommonState(
					this.domainStore,
					this,
					data.commonState.id,
					data.commonState.trackId,
				);
				this.commonState.fetchedFromFirebase(data.commonState);
				this.highLabel = data.highLabel;
				this.lowLabel = data.lowLabel;
				this.setVideoLink(data.videoLink);
				resolve(true);
			})).catch((error) => {
				reject("edit fetch error: " + error.message);
			});
		});
	}

	videoStateConverter = {
		toFirestore: function(videoState) {
			const data = {
				videoLink: videoState.videoLink,
				source: videoState.source,
				//transcript: videoState.transcript,
				//moments: videoState.moments,
				// videoMetadata: {
				// 	...videoState.videoMetadata,
				// },
				commonState: videoState.commonState.commonStateConverter.toFirestore(videoState.commonState),
				highLabel: videoState.highLabel,
				lowLabel: videoState.lowLabel,
			}
			//console.log("to", data);
			return data;
		},
		fromFirestore: function(snapshot, options) {
			const data = snapshot.data(options);
			//console.log("from", data);
			return data;
		},
	};
}

export default VideoState;
