import { makeAutoObservable } from "mobx";

class TextState {
    processing = false;
    id = "test";
	content = "HELLO";

	textStyle = {
		fill: "green",
		fontSize: 50,
		fontFamily: "Arial",
		align: "center",
	};

	thumbnail = null;

    start = 0;
    duration = 10;
    offset = 0;
    speed = 1;

    x = 0;
    y = 0;
    z = 0;
    // width = 1280;
    // height = 720;
    width = 200;
    height = 100;
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

    constructor(domainStore, content, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;

        this.id = id;
        this.content = content;
        this.processing = false;
        this.trackInfo.trackId = trackId;
    }

    setMetadata(metadata) {
        this.thumbnails = metadata.thumbnail ? metadata.thumbnail : null;
        this.start = 0;
        this.duration = metadata.duration;
        this.offset = metadata.offset ? metadata.offset : 0;
        this.speed = metadata.speed ? metadata.speed : 1;

        this.x = metadata.x ? metadata.x : 0;
        this.y = metadata.y ? metadata.y : 0;
        this.z = metadata.z ? metadata.z : 0;
        this.width = metadata.textWidth;
        this.height = metadata.textHeight;
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

    get finish() {
        return this.start + this.duration;
    }
}

export default TextState;
