import { makeAutoObservable } from "mobx";

import VideoState from "./videoState";

class DomainStore {
    videos = [];
    audios = [];
    images = [];
    texts = [];

    projectMetadata = {
        projectId: "test",
        title: "TEST",
        fps: 25,
        width: 1280,
        height: 720, //720p
        duration: 10, // seconds
        trackCnt: 3,
    };

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;

        this.videos = [
            new VideoState(this, "http://localhost:3000/demo-3.webm", "video-1", 0),
            new VideoState(this, "http://localhost:3000/demo-3.webm", "video-2", 1),
            new VideoState(this, "http://localhost:3000/demo-3.webm", "video-3", 2),
        ];
    }
}

export default DomainStore;
