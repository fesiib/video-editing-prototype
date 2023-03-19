import { makeAutoObservable } from "mobx";

class CommonState {
    processing = false;
    id = "test";

    thumbnails = [];

    start = 0; // start after trimming relative to video
    finish = 10; // finish after trimming relative to video
    duration = 10; // total duration (should not change)
    offset = 0; // offset relative to timeline
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
        this.start = metadata.start ? metadata.start: this.start;
        this.duration = metadata.duration ? metadata.duration : this.duration;
        this.finish = metadata.finish ? metadata.finish : this.finish;
        this.offset = metadata.offset ? metadata.offset : this.offset;
        this.speed = metadata.speed ? metadata.speed : this.speed;

        this.x = metadata.x ? metadata.x : this.x;
        this.y = metadata.y ? metadata.y : this.y;
        this.z = metadata.z ? metadata.z : this.z;
        this.width = metadata.width ? metadata.width: this.width;
        this.height = metadata.height ? metadata.height: this.height;
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

    get end() { // relative to timline
        return this.offset + (this.finish - this.start);
    }

    get sceneDuration() { // relative to timline
        return this.finish - this.start;
    }
}

export default CommonState;
