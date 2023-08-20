import { makeAutoObservable } from "mobx";

class CommonState {
    processing = false;
    id = "test";

    thumbnails = ["unknown"];

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

	trackId = 0;

    constructor(domainStore, object, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
		this.object = object;
        this.id = id;
        this.processing = true;
        this.trackId = trackId;
    }

    setMetadata(metadata) {
        this.thumbnails = metadata.thumbnails ? metadata.thumbnails : this.thumbnails;
        this.start = metadata.start ? metadata.start : this.start;
        this.duration = metadata.duration ? metadata.duration : this.duration;
        this.finish = metadata.finish ? metadata.finish : this.finish;
        this.offset = metadata.offset ? metadata.offset : this.offset;
        this.speed = metadata.speed ? metadata.speed : this.speed;

        this.x = metadata.x ? metadata.x : this.x;
        this.y = metadata.y ? metadata.y : this.y;
        this.z = metadata.z ? metadata.z : this.z;
        this.width = metadata.width ? metadata.width : this.width;
        this.height = metadata.height ? metadata.height : this.height;
        this.scaleX = metadata.scaleX ? metadata.scaleX : this.scaleX;
        this.scaleY = metadata.scaleY ? metadata.scaleY : this.scaleY;
        this.rotation = metadata.rotation ? metadata.rotation : this.rotation;

        this.animation = metadata.animation ? metadata.animation : this.animation;
        this.filterMap = metadata.filterMap ? metadata.filterMap : this.filterMap;

        this.transitionStart = {};
        this.transitionEnd = {};

        this.trackId = metadata.trackId ? metadata.trackId : this.trackId;

        this.processing = metadata.processing ? metadata.processing : this.processing;

        if (this.end >= this.domainStore.projectMetadata.duration) {
            this.domainStore.projectMetadata.duration = this.end;
			this.domainStore.rootStore.uiStore.timelineConst.trackMaxDuration = this.end;
        }
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

    offsetToNative(timestamp) {
        const native = timestamp - this.offset + this.start;
        return native;
    }

	splitObject(offsetTimestamp) {
        const nativeTimestamp = this.offsetToNative(offsetTimestamp);
        const right = this.object.getDeepCopy();
		const left = this.object.getDeepCopy();

        right.commonState.setMetadata({
            offset: offsetTimestamp,
            start: nativeTimestamp,
        });
        left.commonState.setMetadata({
            finish: nativeTimestamp,
        });

		console.log(left.commonState.id, right.commonState.id);
		return {
			left,
			right
		};
	}

	isVisible(playPosition) {
        return (this.offset <= playPosition &&
        	this.end > playPosition);
	}

	get isVisibleOnCanvas() {
		return this.isVisible(this.domainStore.rootStore.uiStore.timelineControls.playPosition);
	}

    get end() {
        // relative to timline
        return this.offset + (this.finish - this.start);
    }

    get sceneDuration() {
        // relative to timline
        return this.finish - this.start;
    }

	get metadata() {
		return {
			thumbnails: [...this.thumbnails],
        	start: this.start,
        	duration: this.duration,
        	finish: this.finish,
        	offset: this.offset,
        	speed: this.speed,

        	x: this.x,
        	y: this.y,
        	z: this.z,
        	width: this.width,
        	height: this.height,
        	scaleX: this.scaleX,
        	scaleY: this.scaleY,
        	rotation: this.rotation,

        	animation: { ...this.animation},
        	filterMap: { ...this.filterMap },

	        transitionStart: { ...this.transitionStart },
			transitionEnd: { ...this.transitionEnd },

			trackId: this.trackId,
			
			processing: this.processing,
		};
	}

}

export default CommonState;
