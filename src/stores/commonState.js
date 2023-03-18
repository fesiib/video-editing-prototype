import { makeAutoObservable } from "mobx";

class CommonState {
    processing = false;
    id = "test";

    thumbnails = [];

    start = 0;
    finish = 10;
    duration = 10;
    offset = 0;
    speed = 1;

    x = 0;
    y = 0;
    z = 0;
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

    constructor(domainStore, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;

        this.id = id;
        this.processing = true;
        this.trackInfo.trackId = trackId;
    }

    setMetadata(metadata) {
        this.thumbnails = metadata.thumbnails ? metadata.thumbnails : null;
        this.start = 0;
        this.duration = metadata.duration;
        this.finish = this.duration;
        this.offset = metadata.offset ? metadata.offset : this.offset;
        this.speed = metadata.speed ? metadata.speed : this.speed;

        this.x = metadata.x ? metadata.x : this.x;
        this.y = metadata.y ? metadata.y : this.y;
        this.z = metadata.z ? metadata.z : this.z;
        this.width = metadata.width;
        this.height = metadata.height;
        this.scaleX = metadata.scaleX ? metadata.scaleX : this.scaleX;
        this.scaleY = metadata.scaleY ? metadata.scaleY : this.scaleY;
        this.rotation = metadata.rotation ? metadata.rotation : this.rotation;

        this.animation = metadata.animation ? metadata.animation : this.animation;
        this.filterMap = metadata.filterMap ? metadata.filterMap : this.filterMap;

        this.transitionStart = {};
        this.transitionEnd = {};

        this.trackInfo.trackId = metadata.trackId ? metadata.trackId : this.trackInfo.trackId;

        this.processing = false;
    }

    onDragEnd(target) {
        this.x = target.x();
        this.y = target.y();
    }

    onTransformerEnd(target) {
        this.scaleX = target.scaleX();
        this.scaleY = target.scaleY();
        this.x = target.x();
        this.y = target.y();
    }

    get end() {
        return this.offset + (this.finish - this.start);
    }

    get sceneDuration() {
        return this.finish - this.start;
    }
}

export default CommonState;
