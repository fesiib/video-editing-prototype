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

    const videoElement = useMemo(() => {
        const element = document.createElement("video");
        element.src = curVideo.source;
        element.loop = true;
        return element;
    }, [curVideo.source]);

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
        curVideo.commonState.setMetadata(metadata);
    });

    useEffect(() => {
        videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
        return () => {
            videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        };
    }, [videoElement]);

    const onCanPlay = () => {
        videoElement.muted = true;
        videoElement.play();
        //videoElement.muted = false;
        const layer = imageRef.current.getLayer();
        const anim = new Animation(() => {}, layer);
        anim.start();
        return () => anim.stop();
    };

    useEffect(() => {
        videoElement.addEventListener("canplay", onCanPlay);
        return () => {
            videoElement.removeEventListener("canplay", onCanPlay);
        };
    }, [videoElement]);

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
            perfectDrawEnabled={false}
            onDragEnd={(event) => curVideo.commonState.onDragEnd(event.target)}
            onTransformEnd={(event) => curVideo.commonState.onTransformerEnd(event.target)}
        />
    );
});

export default DraggableVideo;
