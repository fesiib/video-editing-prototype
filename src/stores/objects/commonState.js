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
        this.thumbnails = metadata.thumbnails !== undefined ? metadata.thumbnails : this.thumbnails;
        this.start = metadata.start !== undefined ? metadata.start : this.start;
        this.duration = metadata.duration !== undefined ? metadata.duration : this.duration;
        this.finish = metadata.finish !== undefined ? metadata.finish : this.finish;
        this.offset = metadata.offset !== undefined ? metadata.offset : this.offset;
        this.speed = metadata.speed !== undefined ? metadata.speed : this.speed;

        this.x = metadata.x !== undefined ? metadata.x : this.x;
        this.y = metadata.y !== undefined ? metadata.y : this.y;
        this.z = metadata.z !== undefined ? metadata.z : this.z;
        this.width = metadata.width !== undefined ? metadata.width : this.width;
        this.height = metadata.height !== undefined ? metadata.height : this.height;
        this.scaleX = metadata.scaleX !== undefined ? metadata.scaleX : this.scaleX;
        this.scaleY = metadata.scaleY !== undefined ? metadata.scaleY : this.scaleY;
        this.rotation = metadata.rotation !== undefined ? metadata.rotation : this.rotation;

        this.animation = metadata.animation !== undefined ? metadata.animation : this.animation;
        this.filterMap = metadata.filterMap !== undefined ? metadata.filterMap : this.filterMap;

        this.transitionStart = {};
        this.transitionEnd = {};

        this.trackId = metadata.trackId !== undefined ? metadata.trackId : this.trackId;

        this.processing = metadata.processing !== undefined ? metadata.processing : this.processing;

        if (this.end >= this.domainStore.projectMetadata.duration) {
            this.domainStore.projectMetadata.duration = this.end;
			this.domainStore.rootStore.uiStore.timelineConst.trackMaxDuration = this.end;
        }
    }

    onDrag(target) {
        this.x = target.x();
        this.y = target.y();
    }

    onTransform(target) {
		if (this.object.title === "Text") {
			const newWidth = this.width * target.scaleX();
			const newHeight = this.height * target.scaleY();

			this.width = newWidth;
			this.height = newHeight;
			this.x = target.x();
			this.y = target.y();
			this.rotation = target.rotation();
		}
		else {
			this.scaleX = target.scaleX();
			this.scaleY = target.scaleY();
			this.x = target.x();
			this.y = target.y();
			this.rotation = target.rotation();
		}
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
