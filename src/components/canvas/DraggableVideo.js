import React, { useEffect, useMemo, useRef, useState } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Image } from "react-konva";
import { Animation } from "konva/lib/Animation";

import useRootContext from "../../hooks/useRootContext";

const DraggableVideo = observer(function DraggableVideo({ curVideo }) {
    const { uiStore } = useRootContext();

    const imageRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const imageElement = document.createElement("img");
    imageElement.src = "/logo192.png";

    const left = curVideo.commonState.offset;
    const right = curVideo.commonState.end;
    const isVisible =
        left <= uiStore.timelineControls.playPosition &&
        right >= uiStore.timelineControls.playPosition;

    const videoElement = useMemo(() => {
        const element = document.createElement("video");
		console.log(curVideo.source)
        element.src = curVideo.source;
        element.loop = true;
        element.id = "video_element_" + curVideo.commonState.id;
        return element;
    }, [curVideo.source, curVideo.commonState.id]);

    const onLoadedMetadata = action(() => {
        const metadata = {
            duration: videoElement.duration,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
            scaleX: 1,
            scaleY: 1,
            x: uiStore.canvasSize.width / 2,
            y: uiStore.canvasSize.height / 2,
        };
		console.log("here", metadata);
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

    // const onEnded = action((event) => {
    // 	if (!isVisible) {
    // 		return;
    // 	}
    // 	console.log(event);
    // 	uiStore.timelineControls.tryPlaying = false;
    // 	uiStore.timelineControls.playPosition = 0;
    // });

    // const onTimeUpdate = action((event) => {
    // 	if (!isVisible) {
    // 		return;
    // 	}
    // 	if (uiStore.timelineControls.isPlaying) {
    // 		uiStore.timelineControls.playPosition = videoElement.currentTime
    // 			+ curVideo.commonState.offset - curVideo.commonState.start;
    // 	}
    // });

    const onCanPlay = action(() => {
        videoElement.muted = true;
        const layer = imageRef.current.getLayer();
        const anim = new Animation(() => {}, layer);
        anim.start();
        return () => anim.stop();
    });

    useEffect(() => {
        videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
        //videoElement.addEventListener("playing", onPlaying);
        videoElement.addEventListener("canplay", onCanPlay);
        //videoElement.addEventListener("ended", onEnded);
        //videoElement.addEventListener("timeupdate", onTimeUpdate);
        return () => {
            videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
            //videoElement.removeEventListener("playing", onPlaying);
            videoElement.removeEventListener("canplay", onCanPlay);
            //videoElement.removeEventListener("ended", onEnded);
            //videoElement.removeEventListener("timeupdate", onTimeUpdate);
        };
    }, [isVisible, videoElement]);

    useEffect(() => {
        const opacity = 1;
        const blur = 0;
        const brightness = 1;
        const canvas = imageRef.current.getLayer().getCanvas()._canvas;
        const filterBrightness = `brightness(${brightness * 100}%)`;
        const filterOpacity = `opacity(${opacity * 100}%)`;
        const filterBlur = `blur(${blur}px)`;
        canvas.style.filter = `${filterOpacity} ${filterBlur} ${filterBrightness}`;
    }, []);

    useEffect(() => {
        setIsSelected(uiStore.canvasControls.transformerNodes.indexOf(imageRef.current) >= 0);
    }, [uiStore.canvasControls.transformerNodes]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        videoElement.currentTime =
            uiStore.timelineControls.playPosition -
            curVideo.commonState.offset +
            curVideo.commonState.start;
    }, [videoElement, isVisible, uiStore.timelineControls.playPosition, curVideo.commonState.offset, curVideo.commonState.start]);

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
            name={uiStore.objectNames.video}
            ref={imageRef}
            image={videoElement}
            //image={imageElement}
            stroke="black"
            x={curVideo.commonState.x}
            y={curVideo.commonState.y}
            width={curVideo.commonState.width}
            height={curVideo.commonState.height}
            offsetX={curVideo.commonState.width / 2}
            offsetY={curVideo.commonState.height / 2}
            scaleX={curVideo.commonState.scaleX}
            scaleY={curVideo.commonState.scaleY}
            draggable={isSelected}
            visible={isVisible}
            perfectDrawEnabled={false}
            onDragEnd={(event) => curVideo.commonState.onDragEnd(event.target)}
            onTransformEnd={(event) => curVideo.commonState.onTransformerEnd(event.target)}
        />
    );
});

export default DraggableVideo;
