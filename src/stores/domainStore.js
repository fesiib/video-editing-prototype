import { makeAutoObservable } from "mobx";

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
			new Video(this, "http://localhost:3000/demo-3.webm", "video-1", 0),
			new Video(this, "http://localhost:3000/demo-3.webm", "video-2", 1),
			new Video(this, "http://localhost:3000/demo-3.webm", "video-3", 2)
		];
    }
}

class Video {
    processing = false;
    id = "test";
    source = "http://localhost:3000/flame.avi";

    thumbnails = [];

    start = 0;
    finish = 10;
    offset = 0;
    speed = 1;

    x = 0;
    y = 0;
    z = 0;
    // width = 1280;
    // height = 720;
    width = 200;
    height = 200;
    scaleX = 1;
	scaleY = 1;
    rotation = 0; //deg

    animation = {};
    filterMap = {};

    transitionStart = {};
    transitionEnd = {};

	trackInfo = {
		trackId: 0,
	};

    constructor(domainStore, source, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;

        this.id = id;
        this.source = source;
        this.processing = true;
		this.trackInfo.trackId = trackId;
    }

    setMetadata(metadata) {
        this.thumbnails = metadata.thumbnails ? metadata.thumbnails : [];
        this.start = 0;
        this.finish = metadata.duration;
        this.offset = metadata.offset ? metadata.offset : 0;
        this.speed = metadata.speed ? metadata.speed : 1;

        this.x = metadata.x ? metadata.x : 0;
        this.y = metadata.y ? metadata.y : 0;
        this.z = metadata.z ? metadata.z : 0;
        this.width = metadata.videoWidth;
        this.height = metadata.videoHeight;
        this.scaleX = metadata.scaleX ? metadata.scaleX : 1;
		this.scaleY = metadata.scaleY ? metadata.scaleY : 1;
        this.rotation = metadata.rotation ? metadata.rotation : 0;

        this.animation = metadata.animation ? metadata.animation : {};
        this.filterMap = metadata.filterMap ? metadata.filterMap : {};

        this.transitionStart = {};
        this.transitionEnd = {};

		this.trackInfo.trackId = metadata.trackId ? metadata.trackId : 0;

        this.processing = false;
    }

	timelineTransform(transform) {
		const retTransform = transform ? {
			transform: `translate3d(${this.x + transform.x}px, ${this.y + transform.y}px, ${this.z}px)`,
		} : {
			transform: `translate3d(${this.x}px, ${this.y}px, ${this.z}px)`,
		}
		return retTransform;
	}
}

export default DomainStore;
