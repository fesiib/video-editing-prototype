import React, { useEffect, useMemo, useRef, useState } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Image } from "react-konva";
import { Animation } from "konva/lib/Animation";

import useRootContext from "../../hooks/useRootContext";
import { adaptCoordinate } from "../../utilities/genericUtilities";

const DraggableVideo = observer(function DraggableVideo({ curVideo }) {
    const { uiStore, domainStore } = useRootContext();

    const videoRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curVideo.isVisible(uiStore.timelineControls.playPosition);
	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(curVideo.commonState.x, curVideo.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(curVideo.commonState.y, curVideo.commonState.height, projectHeight, canvasHeight);

	const filterMap = curVideo.commonState.filterMap;

	const videoElement = useMemo(() => {
        const element = document.createElement("video");
		console.log("video-source: ", curVideo.source)
        element.src = curVideo.source;
        element.loop = false;
        element.id = "video_element_" + curVideo.commonState.id;
		return element;
    }, [curVideo.source, curVideo.commonState.id]);

    const onLoadedMetadata = action((event) => {
		let passedCurVideo = false;
		for (let video of domainStore.in_mainVideos) {
			if (video.commonState.id === curVideo.commonState.id) {
				passedCurVideo = true;
				continue;
			}
			if (passedCurVideo === true) {
				video.commonState.setMetadata({
					offset: video.commonState.offset + event.target.duration,
				});
			}
		}
		console.log("video-duration", event.target.duration);
		const metadata = {
            duration: event.target.duration,
			start: 0,
			finish: event.target.duration,
            width: domainStore.projectMetadata.width,
            height: domainStore.projectMetadata.height,
			scaleX: 1,
			scaleY: 1,
            x: 0,
            y: 0,
			cropX: 0,
			cropY: 0,
			cropWidth: event.target.videoWidth,
			cropHeight: event.target.videoHeight,
			processing: false,
			originalWidth: event.target.videoWidth,
			originalHeight: event.target.videoHeight,
        };
        curVideo.commonState.setMetadata(metadata);
    });

    // const onPlaying = action(((event) => {
    // 	if (!isVisible) {
    // 		return;
    // 	}
    // 	console.log(event);
    // 	uiStore.timelineControls.playPosition = videoElement.currentTime
    // 		+ curVideo.commonState.offset - curVideo.commonState.start;
    // }));

    const onEnded = action(() => {
		if (curVideo.commonState.end < domainStore.projectMetadata.duration) {
			uiStore.timelineControls.playPosition = curVideo.commonState.end;
		}
		else {
			uiStore.timelineControls.playPosition = 0;
			uiStore.timelineControls.isPlaying = false;
		}
    });

    // const onTimeUpdate = action((event) => {
	// 	console.log(isVisible, curVideo.commonState.id, event.target);
    // 	if (!isVisible) {
	// 		event.target.pause();
	// 		event.target.currentTime = curVideo.commonState.start;
    // 		return;
    // 	}
	// 	uiStore.timelineControls.playPosition = event.target.currentTime
	// 		+ curVideo.commonState.offset - curVideo.commonState.start;
	// 	return () => {};
    // });

    const onCanPlay = ((event) => {
		if (videoRef.current === null) {
			return;
		}
        //event.target.muted = true;
        const layer = videoRef.current.getLayer();
        const anim = new Animation(() => {}, layer);
        anim.start();
        return () => anim.stop();
    });

	useEffect(() => {
		//console.log(filterMap.blur, filterMap.opacity, filterMap.brightness);
		if (videoRef.current === null) {
			return;
		}
        const opacity = filterMap.opacity;
        const blur = filterMap.blur;
        const brightness = filterMap.brightness;
        const canvas = videoRef.current.getLayer().getCanvas()._canvas;
        const filterBrightness = `brightness(${brightness * 100}%)`;
        const filterOpacity = `opacity(${opacity * 100}%)`;
        const filterBlur = `blur(${blur}px)`;
        canvas.style.filter = `${filterOpacity} ${filterBlur} ${filterBrightness}`;
    }, [
		filterMap.opacity,
		filterMap.blur,
		filterMap.brightness,
	]);

	useEffect(action(() => {
		if (videoRef.current === null) {
			return;
		}
		if (!isVisible) {
			uiStore.removeSelectedCanvasObject(videoRef.current.id());
		}
		else if (
			uiStore.timelineControls.selectedTimelineItems.findIndex(
				(item) => (item.commonState.id === videoRef.current.id())
			) >= 0
			&& 	uiStore.timelineControls.selectedTimelineItems.length === 1
		) {
			uiStore.addSelectedCanvasObject(videoRef.current.id());
		}
    }), [
		isVisible,
		videoRef.current,
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

    useEffect(action(() => {
		if (videoRef.current === null) {
			return;
		}
		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(videoRef.current.id()) >= 0);
    }), [
		videoRef.current,
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);

    useEffect(action(() => {
        videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
        //videoElement.addEventListener("playing", onPlaying);
        videoElement.addEventListener("canplay", onCanPlay);
        videoElement.addEventListener("ended", onEnded);
        //videoElement.addEventListener("timeupdate", onTimeUpdate);
		
		const interval = setInterval(action(() => {
			if (!isVisible || videoElement.paused) {
				return;
			}
			//console.log(isVisible, curVideo.commonState.id, videoElement.currentTime);
			uiStore.timelineControls.playPosition = videoElement.currentTime
				+ curVideo.commonState.offset - curVideo.commonState.start;
		}), 100);
        return action(() => {
            videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
            //videoElement.removeEventListener("playing", onPlaying);
            videoElement.removeEventListener("canplay", onCanPlay);
            videoElement.removeEventListener("ended", onEnded);
            //videoElement.removeEventListener("timeupdate", onTimeUpdate);
			clearInterval(interval);
        });
    }), [
		isVisible,
		videoElement,
		videoElement.paused,
		videoElement.currentTime,
		curVideo.commonState.offset, curVideo.commonState.start
	]);

    useEffect(() => {
		// set videoElement.currentTime to playPosition if it is not playing
        if (!isVisible) {
            return;
        }
		const adaptedPlayPosition = uiStore.timelineControls.playPosition -
			curVideo.commonState.offset + curVideo.commonState.start;
		if (uiStore.timelineControls.isPlaying === false
			|| Math.abs(videoElement.currentTime - adaptedPlayPosition) > 0.5
		) {
			videoElement.currentTime = adaptedPlayPosition;
		}
    }, [
		isVisible,
		videoElement,
		uiStore.timelineControls.playPosition,
		curVideo.commonState.offset,
		curVideo.commonState.start
	]);

	useEffect(action(() => {
		// play/pause based on isVisible and isPlaying
		if (!isVisible) {
			videoElement.pause();
			return;
		}
		if (!uiStore.timelineControls.isPlaying) {
			videoElement.pause();
			uiStore.timelineControls.playPosition = videoElement.currentTime
				+ curVideo.commonState.offset - curVideo.commonState.start;
			return;
		}
		if (uiStore.timelineControls.isPlaying) {
			videoElement.play();
		}
	}), [
		isVisible, 
		//videoElement,
		//videoElement.paused,
		uiStore.timelineControls.isPlaying,
	]);

    // useEffect(() => {
    // 	if (!isVisible) {
    // 		return;
    // 	}
    // 	if (videoElement.paused || !uiStore.timelineControls.isPlaying) {
    // 		videoElement.currentTime = uiStore.timelineControls.playPosition;
    // 	}
    // }, [isVisible,
    // 	videoElement,
    // 	uiStore.timelineControls.playPosition,
    // 	uiStore.timelineControls.isPlaying
    // ]);

    // useEffect(action(() => {
    // 	if (!isVisible) {
    // 		return;
    // 	}
    // 	uiStore.timelineControls.isPlaying = false;
    // 	if (!uiStore.timelineControls.tryPlaying) {
    // 		videoElement.pause();
    // 	}
    // 	else {
    // 		videoElement.play().then(action(() => {
    // 			uiStore.timelineControls.isPlaying = true;
    // 		}));
    // 	}
    // }), [isVisible, videoElement, uiStore.timelineControls.tryPlaying]);

    return (
        <Image
			id={curVideo.commonState.id}
            name={"video"}
            ref={videoRef}
            image={videoElement}
            //image={imageElement}
            x={x}
            y={y}
            width={curVideo.commonState.width}
            height={curVideo.commonState.height}
            offsetX={curVideo.commonState.width / 2}
            offsetY={curVideo.commonState.height / 2}
            scaleX={curVideo.commonState.scaleX}
            scaleY={curVideo.commonState.scaleY}
			cropX={curVideo.commonState.cropX}
			cropY={curVideo.commonState.cropY}
			cropWidth={curVideo.commonState.cropWidth}
			cropHeight={curVideo.commonState.cropHeight}
			draggable={isSelected}
            visible={isVisible}
            perfectDrawEnabled={false}
			
            //onDragMove={(event) => curVideo.commonState.onDragMove(event.target)}
            //onTransform={(event) => curVideo.commonState.onTransform(event.target)}
        />
    );
});

export default DraggableVideo;
