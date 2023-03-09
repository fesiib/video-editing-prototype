import React, { useEffect, useMemo, useRef, useState } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Image } from "react-konva";
import { Animation } from "konva/lib/Animation";

import useRootContext from "../../hooks/useRootContext";

const DraggableVideo = observer(function DraggableVideo({ curVideo, transformerRef }) {
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
            videoWidth: videoElement.videoWidth,
            videoHeight: videoElement.videoHeight,
            scaleX: 1,
            scaleY: 1,
            x: uiStore.canvasSize.width / 2,
            y: uiStore.canvasSize.height / 2,
        };
        curVideo.setMetadata(metadata);
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

    const onVideoDragEnd = action((event) => {
        curVideo.x = event.target.x();
        curVideo.y = event.target.y();
    });

    const onTransformerEnd = action((event) => {
        curVideo.scaleX = event.target.scaleX();
        curVideo.scaleY = event.target.scaleY();
        curVideo.x = event.target.x();
        curVideo.y = event.target.y();
    });

    useEffect(() => {
        videoElement.addEventListener("canplay", onCanPlay);
        return () => {
            videoElement.removeEventListener("canplay", onCanPlay);
        };
    }, [videoElement]);

    useEffect(() => {
        if (!isSelected) {
            transformerRef.current.detach();
            transformerRef.current.off("transformend");
        } else {
            transformerRef.current.nodes([imageRef.current]);
            transformerRef.current.on("transformend", onTransformerEnd);
        }
        transformerRef.current.getLayer().batchDraw();
    }, [isSelected, transformerRef]);

    useEffect(() => {
        const opacity = 0.5;
        const blur = 20;
		const brightness = 2;
        const canvas = imageRef.current.getLayer().getCanvas()._canvas;
		const filterBrightness = `brightness(${brightness * 100}%)`;
		const filterOpacity = `opacity(${opacity * 100}%)`;
		const filterBlur = `blur(${blur}px)`;
		canvas.style.filter = `${filterOpacity} ${filterBlur} ${filterBrightness}`;
    }, []);

    return (
        <Image
            ref={imageRef}
            image={videoElement}
            //image={imageElement}
            stroke="black"
            x={curVideo.x}
            y={curVideo.y}
            width={curVideo.width}
            height={curVideo.height}
            offsetX={curVideo.width / 2}
            offsetY={curVideo.height / 2}
            scaleX={curVideo.scaleX}
            scaleY={curVideo.scaleY}
            draggable={isSelected}
            onDblClick={() => setIsSelected(!isSelected)}
            onDragEnd={onVideoDragEnd}
            perfectDrawEnabled={false}
        />
    );
});

export default DraggableVideo;
