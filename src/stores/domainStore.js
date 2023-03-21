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
