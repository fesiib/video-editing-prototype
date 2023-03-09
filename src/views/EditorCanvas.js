import React, { useEffect, useRef } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Layer, Rect, Stage, Transformer } from "react-konva";

import useRootContext from "../hooks/useRootContext";
import DraggableVideo from "../components/canvas/DraggableVideo";
import DraggableText from "../components/canvas/DraggableText";

const EditorCanvas = observer(function EditorCanvas() {
    const transformerRef = useRef(null);

    const { uiStore, domainStore } = useRootContext();

    const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

    const onZoomChange = action((event) => {
        uiStore.canvasControls.scalePos = event.target.value;
    });

    const onBackgroundClick = () => {
        transformerRef.current.nodes([]);
    };

    useEffect(
        action(() => {
            const minWindowHeight = uiStore.canvasSize.height - uiStore.canvasConst.margin;
            const minWindowWidth = uiStore.canvasSize.width - uiStore.canvasConst.margin;
            while (
                (projectHeight * uiStore.canvasScale > minWindowHeight ||
                    projectWidth * uiStore.canvasScale > minWindowWidth) &&
                uiStore.canvasControls.scalePos > 0
            ) {
                uiStore.canvasControls.scalePos--;
            }
        }),
        [projectHeight, projectWidth]
    );

    return (
        <>
            <div>
                <label htmlFor="canvas_zoom"> Zoom {uiStore.canvasZoom} </label>
                <input
                    id="canvas_zoom"
                    type={"range"}
                    min={0}
                    max={10}
                    value={uiStore.canvasControls.scalePos}
                    onChange={onZoomChange}
                />
            </div>
            <Stage width={uiStore.canvasSize.width} height={uiStore.canvasSize.height}>
                <Layer>
                    <Rect
                        x={0}
                        y={0}
                        width={uiStore.canvasSize.width}
                        height={uiStore.canvasSize.height}
                        fill="red"
                        onClick={onBackgroundClick}
                    />
                </Layer>
                <Layer
                    scaleX={uiStore.canvasScale}
                    scaleY={uiStore.canvasScale}
                    offsetX={uiStore.canvasSize.width / 2}
                    offsetY={uiStore.canvasSize.height / 2}
                    x={uiStore.canvasSize.width / 2}
                    y={uiStore.canvasSize.height / 2}
                >
                    <Rect
                        x={uiStore.canvasSize.width / 2}
                        y={uiStore.canvasSize.height / 2}
                        width={projectWidth}
                        height={projectHeight}
                        offsetX={projectWidth / 2}
                        offsetY={projectHeight / 2}
                        fill="black"
                        scaleX={1}
                        scaleY={1}
                    />
                    <Transformer
                        ref={transformerRef}
                        rotateAnchorOffset={60}
                        enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                    />
                </Layer>
				<Layer
                    scaleX={uiStore.canvasScale}
                    scaleY={uiStore.canvasScale}
                    offsetX={uiStore.canvasSize.width / 2}
                    offsetY={uiStore.canvasSize.height / 2}
                    x={uiStore.canvasSize.width / 2}
                    y={uiStore.canvasSize.height / 2}
                >
					<DraggableVideo
                        curVideo={domainStore.videos[0]}
                        transformerRef={transformerRef}
                    />
				</Layer>
				<Layer
					scaleX={uiStore.canvasScale}
					scaleY={uiStore.canvasScale}
					offsetX={uiStore.canvasSize.width / 2}
					offsetY={uiStore.canvasSize.height / 2}
					x={uiStore.canvasSize.width / 2}
					y={uiStore.canvasSize.height / 2}
				>
					<DraggableText
						curText={domainStore.texts[0]}
						transformerRef={transformerRef}
					/>
				</Layer>
            </Stage>
        </>
    );
});

export default EditorCanvas;
