import { makeAutoObservable } from "mobx";

import VideoState from "./videoState";
import TextState from "./textState";
import IntentState from "./intentState";

class DomainStore {
    videos = [];
    audios = [];
    images = [];
    texts = [];
	intents = [];

    projectMetadata = {
        projectId: "test",
        title: "TEST",
        fps: 25,
        width: 854,
        height: 480, //720p
        duration: 10, // seconds
        trackCnt: 2,
    };

	curIntentPos = 0;

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;

        this.videos = [
        ];
        this.texts = [
            //new TextState(this, "HELLO WORLD !", "text-1", 3),
            //new TextState(this, "ANOTHER text !", "text-2", 4),
        ];
		this.intents = [
				new IntentState(this, "", [], "todo", 0, 0)
		];
		this.curIntentPos = 0;
    }

    splitVideo(originalVideo, offsetTimestamp) {
        const nativeTimestamp = originalVideo.commonState.offsetToNative(offsetTimestamp);
        const video = new VideoState(
            this,
            originalVideo.source,
            originalVideo.commonState.id + "split" + offsetTimestamp,
            originalVideo.commonState.trackInfo.trackId
        );
        video.commonState.setMetadata({
            ...originalVideo.commonState,
            offset: offsetTimestamp,
            start: nativeTimestamp,
        });
        video.lowLabel = originalVideo.lowLabel;
        video.highLabel = originalVideo.highLabel;
        originalVideo.commonState.setMetadata({
            finish: nativeTimestamp,
        });

        let videoTranscript = [];
        let originalVideoTranscript = [];

        for (let script of originalVideo.transcript) {
            if (script.finish <= nativeTimestamp) {
                originalVideoTranscript.push(script);
            } else {
                if (script.start >= nativeTimestamp) {
                    videoTranscript.push(script);
                } else if (script.finish - script.start > 0) {
                    const proportionOfText =
                        (nativeTimestamp - script.start) / (script.finish - script.start);
                    let textMiddle = Math.round(proportionOfText * script.text.length);
                    while (textMiddle < script.text.length && script.text[textMiddle] !== " ") {
                        textMiddle += 1;
                    }
                    originalVideoTranscript.push({
                        text: script.text.slice(0, textMiddle),
                        start: script.start,
                        finish: nativeTimestamp,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                    videoTranscript.push({
                        text: script.text.slice(textMiddle + 1),
                        start: nativeTimestamp,
                        finish: script.finish,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                }
            }
        }

        video.setTranscript(videoTranscript);
        originalVideo.setTranscript(originalVideoTranscript);

        this.videos = [...this.videos, video];
    }

    get transcripts() {
        let transcript = [];
        for (let video of this.videos) {
            transcript = [...transcript, ...video.adjustedTranscript];
        }
        transcript.sort((p1, p2) => p1.start - p2.start);
        return transcript;
    }
}

export default DomainStore;
