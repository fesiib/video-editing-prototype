import { makeAutoObservable } from "mobx";

import VideoState from "./videoState";
import TextState from "./textState";

class DomainStore {
    videos = [];
    audios = [];
    images = [];
    texts = [];

    projectMetadata = {
        projectId: "test",
        title: "TEST",
        fps: 25,
        width: 854,
        height: 480, //720p
        duration: 10, // seconds
        trackCnt: 2,
    };

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;

        this.videos = [
            //new VideoState(this, "http://localhost:3000/demo-3.webm", "video-1", 0),
            //new VideoState(this, "http://localhost:3000/example.mp4", "video-2", 1),
            //new VideoState(this, "http://localhost:3000/demo-3.webm", "video-3", 2),
        ];
        this.texts = [
            //new TextState(this, "HELLO WORLD !", "text-1", 3),
            //new TextState(this, "ANOTHER text !", "text-2", 4),
        ];
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

        let videoScript = [];
        let originalVideoScript = [];

        for (let script of originalVideo.script) {
            if (script.finish <= nativeTimestamp) {
                originalVideoScript.push(script);
            } else {
                if (script.start >= nativeTimestamp) {
                    videoScript.push(script);
                } else if (script.finish - script.start > 0) {
                    const proportionOfText =
                        (nativeTimestamp - script.start) / (script.finish - script.start);
                    let textMiddle = Math.round(proportionOfText * script.text.length);
                    while (textMiddle < script.text.length && script.text[textMiddle] !== " ") {
                        textMiddle += 1;
                    }
                    originalVideoScript.push({
                        text: script.text.slice(0, textMiddle),
                        start: script.start,
                        finish: nativeTimestamp,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                    videoScript.push({
                        text: script.text.slice(textMiddle + 1),
                        start: nativeTimestamp,
                        finish: script.finish,
                        lowLabel: script.lowLabel,
                        highLabel: script.highLabel,
                    });
                }
            }
        }

        video.setScript(videoScript);
        originalVideo.setScript(originalVideoScript);

        this.videos = [...this.videos, video];
    }

    get scripts() {
        let script = [];
        for (let video of this.videos) {
            script = [...script, ...video.adjustedScript];
        }
        script.sort((p1, p2) => p1.start - p2.start);
        return script;
    }
}

export default DomainStore;
