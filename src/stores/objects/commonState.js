import { makeAutoObservable } from "mobx";
import { adaptCoordinate, groundCoordinate, roundNumber } from "../../utilities/genericUtilities";

class CommonState {
	updateAuthorCrop = null;
	updateAuthorCut = null;
	updateAuthorBlur = null;
	updateAuthorZoom = null;

    processing = false;
    id = "test";

    thumbnails = ["edit"];

    start = 0; // start after trimming relative to video
    finish = 0; // finish after trimming relative to video
    duration = 0; // total duration (should not change)
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

	cropped = false;
	cropX = 0;
	cropY = 0;
	cropWidth = 0;
	cropHeight = 0;

	originalWidth = 0;
	originalHeight = 0;


    animation = {};
    filterMap = {
		opacity: 1,
		brightness: 1,
		blur: 0,
	};

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
		this.updateAuthorCut = metadata.updateAuthorCut !== undefined ? metadata.updateAuthorCut : this.updateAuthorCut;
		this.updateAuthorCrop = metadata.updateAuthorCrop !== undefined ? metadata.updateAuthorCrop : this.updateAuthorCrop;
		this.updateAuthorBlur = metadata.updateAuthorBlur !== undefined ? metadata.updateAuthorBlur : this.updateAuthorBlur;
		this.updateAuthorZoom = metadata.updateAuthorZoom !== undefined ? metadata.updateAuthorZoom : this.updateAuthorZoom;
        
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

		this.cropped = metadata.cropped !== undefined ? metadata.cropped : this.cropped;
		this.cropX = metadata.cropX !== undefined ? metadata.cropX : this.cropX;
		this.cropY = metadata.cropY !== undefined ? metadata.cropY : this.cropY;
		this.cropWidth = metadata.cropWidth !== undefined ? metadata.cropWidth : this.cropWidth;
		this.cropHeight = metadata.cropHeight !== undefined ? metadata.cropHeight : this.cropHeight;

		this.originalWidth = metadata.originalWidth !== undefined ? metadata.originalWidth : this.originalWidth;
		this.originalHeight	= metadata.originalHeight !== undefined ? metadata.originalHeight : this.originalHeight;

        this.animation = metadata.animation !== undefined ? 
			{ ...this.animation, ...metadata.animation } : this.animation;
        this.filterMap = metadata.filterMap !== undefined ? 
			{ ...this.filterMap, ...metadata.filterMap } : this.filterMap;

        this.transitionStart = {};
        this.transitionEnd = {};

        this.trackId = metadata.trackId !== undefined ? metadata.trackId : this.trackId;

        this.processing = metadata.processing !== undefined ? metadata.processing : this.processing;

        if (this.end >= this.domainStore.projectMetadata.duration) {
            this.domainStore.projectMetadata.duration = this.end;
			this.domainStore.rootStore.uiStore.timelineConst.trackMaxDuration = this.end;
        }
    }

    onDragMove(target) {
		const projectWidth = this.domainStore.projectMetadata.width;
		const projectHeight = this.domainStore.projectMetadata.height;
		const canvasWidth = this.domainStore.rootStore.uiStore.canvasSize.width;
		const canvasHeight = this.domainStore.rootStore.uiStore.canvasSize.height;
		if (this.object.isSuggested) {
			let oldX = this.x;
			let oldY = this.y;
			if (this.object.title === "Crop") {
				if (target.id().substring(0, 2) === "bg") {
					oldX = this.object.cropParameters.x;
					oldY = this.object.cropParameters.y;
				}
				if (target.id().substring(0, 2) === "fg") {
					oldX = this.object.cropParameters.cropX;
					oldY = this.object.cropParameters.cropY;
				}
			}
			target.setAttrs({
				x: roundNumber(adaptCoordinate(oldX, target.width(), projectWidth, canvasWidth), 0),
				y: roundNumber(adaptCoordinate(oldY, target.height(), projectHeight, canvasHeight), 0),
			});
			return;
		}
		if (this.object.title === "Text"
			|| this.object.title === "Image"
			|| this.object.title === "Shape"
			|| this.object.title === "Zoom"
		) {
			this.x = roundNumber(groundCoordinate(target.x(), target.width(), projectWidth, canvasWidth), 0);
        	this.y = roundNumber(groundCoordinate(target.y(), target.height(), projectHeight, canvasHeight), 0);
		}
		if (this.object.title === "Crop") {
			if (target.id().substring(0, 2) === "bg") {
				this.object.cropParameters.x = roundNumber(groundCoordinate(target.x(), target.width(), projectWidth, canvasWidth), 0);
				this.object.cropParameters.y = roundNumber(groundCoordinate(target.y(), target.height(), projectHeight, canvasHeight), 0);
			}
			if (target.id().substring(0, 2) === "fg") {
				this.object.cropParameters.cropX = roundNumber(groundCoordinate(target.x(), target.width(), projectWidth, canvasWidth), 0);
				this.object.cropParameters.cropY = roundNumber(groundCoordinate(target.y(), target.height(), projectHeight, canvasHeight), 0);
			}
		}
    }

    onTransform(target) {
		if (this.object.isSuggested) {
			this.onDragMove(target);
			let oldAttrs = {
				width: this.width,
				height: this.height,
			};
			if (this.object.title === "Crop") {
				if (target.id().substring(0, 2) === "bg") {
					oldAttrs = {
						width: this.object.cropParameters.width,
						height: this.object.cropParameters.height,
					};
				}
				if (target.id().substring(0, 2) === "fg") {
					oldAttrs = {
						width: this.object.cropParameters.cropWidth,
						height: this.object.cropParameters.cropHeight,
					};
				}
			}
			target.setAttrs({
				scaleX: this.scaleX,
				scaleY: this.scaleY,
				rotation: this.rotation,
				...oldAttrs,
			});
			return;
		}
		const minWidth = this.domainStore.rootStore.uiStore.canvasConst.minWidth;
		const minHeight = this.domainStore.rootStore.uiStore.canvasConst.minHeight;
		const projectWidth = this.domainStore.projectMetadata.width;
		const projectHeight = this.domainStore.projectMetadata.height;
		const canvasWidth = this.domainStore.rootStore.uiStore.canvasSize.width;
		const canvasHeight = this.domainStore.rootStore.uiStore.canvasSize.height;

		let targetAttrs = {};

		if (this.object.title === "Text"
			|| this.object.title === "Image"
			|| this.object.title === "Shape"
			|| this.object.title === "Zoom"
		) {
			const newWidth = Math.max(target.width() * target.scaleX(), minWidth);
			const newHeight = Math.max(target.height() * target.scaleY(), minHeight);
			
			this.width = roundNumber(newWidth, 0);
			this.height = roundNumber(newHeight, 0);

			this.x = roundNumber(groundCoordinate(target.x(), newWidth, projectWidth, canvasWidth), 0);
        	this.y = roundNumber(groundCoordinate(target.y(), newHeight, projectHeight, canvasHeight), 0);
		
			targetAttrs = {
				width: this.width,
				height: this.height,
			};
		}
		if (this.object.title === "Crop") {
			const newWidth = Math.max(target.width() * target.scaleX(), minWidth);
			const newHeight = Math.max(target.height() * target.scaleY(), minHeight);

			if (target.id().substring(0, 2) === "bg") {
				this.object.cropParameters.width = roundNumber(newWidth, 0);
				this.object.cropParameters.height = roundNumber(newHeight, 0);
	
				this.object.cropParameters.x = roundNumber(groundCoordinate(target.x(), newWidth, projectWidth, canvasWidth), 0);
				this.object.cropParameters.y = roundNumber(groundCoordinate(target.y(), newHeight, projectHeight, canvasHeight), 0);
			
				targetAttrs = {
					width: this.object.cropParameters.width,
					height: this.object.cropParameters.height,
				};
			}
			if (target.id().substring(0, 2) === "fg") {
				this.object.cropParameters.cropWidth = roundNumber(newWidth, 0);
				this.object.cropParameters.cropHeight = roundNumber(newHeight, 0);
	
				this.object.cropParameters.cropX = roundNumber(groundCoordinate(target.x(), newWidth, projectWidth, canvasWidth), 0);
				this.object.cropParameters.cropY = roundNumber(groundCoordinate(target.y(), newHeight, projectHeight, canvasHeight), 0);
				
				targetAttrs = {
					width: this.object.cropParameters.cropWidth,
					height: this.object.cropParameters.cropHeight,
				};
			}
		}
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotation = roundNumber(target.rotation(), 0);

		target.setAttrs({
			scaleX: this.scaleX,
			scaleY: this.scaleY,
			rotation: this.rotation,
			x: target.x(),
			y: target.y(),
			...targetAttrs,
		});
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
