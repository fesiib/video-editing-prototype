import React, { useEffect, useRef, useState } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Layer, Rect, Stage, Transformer } from "react-konva";

import useRootContext from "../hooks/useRootContext";
import { Util } from "konva/lib/Util";
import DraggableVideo from "../components/canvas/DraggableVideo";
import DraggableText from "../components/canvas/DraggableText";

const EditorCanvas = observer(function EditorCanvas() {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const selectionRectRef = useRef(null);

    const [selectionRectCoordinates, setSelectionRectCoordinates] = useState([0, 0, 0, 0]);

    const { uiStore, domainStore } = useRootContext();

    const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

    const onZoomChange = action((event) => {
        uiStore.canvasControls.scalePos = event.target.value;
    });

    const isBackground = (target) => {
        return target.name() === uiStore.backgroundName;
    };
    const isObject = (target) => {
        for (let i in uiStore.objectNames) {
            const objectName = uiStore.objectNames[i];
            if (objectName === target.name()) {
                return true;
            }
        }
        return false;
    };

    const onStageMouseDown = action((event) => {
        if (!isBackground(event.target)) {
            return;
        }
        event.evt.preventDefault();
        setSelectionRectCoordinates([
            stageRef.current.getPointerPosition().x,
            stageRef.current.getPointerPosition().y,
            stageRef.current.getPointerPosition().x,
            stageRef.current.getPointerPosition().y,
        ]);
        transformerRef.current.nodes([]);
        uiStore.canvasControls.transformerNodes = [];
        selectionRectRef.current.visible(true);
        selectionRectRef.current.width(0);
        selectionRectRef.current.height(0);
    });

    const onStageMouseMove = (event) => {
        if (!selectionRectRef.current.visible()) {
            return;
        }
        event.evt.preventDefault();
        setSelectionRectCoordinates([
            selectionRectCoordinates[0],
            selectionRectCoordinates[1],
            stageRef.current.getPointerPosition().x,
            stageRef.current.getPointerPosition().y,
        ]);
        selectionRectRef.current.x(
            Math.min(selectionRectCoordinates[0], selectionRectCoordinates[2])
        );
        selectionRectRef.current.y(
            Math.min(selectionRectCoordinates[1], selectionRectCoordinates[3])
        );
        selectionRectRef.current.width(
            Math.abs(selectionRectCoordinates[0] - selectionRectCoordinates[2])
        );
        selectionRectRef.current.height(
            Math.abs(selectionRectCoordinates[1] - selectionRectCoordinates[3])
        );
    };

    const onStageMouseUp = action((event) => {
        if (!selectionRectRef.current.visible()) {
            return;
        }
        event.evt.preventDefault();

        setTimeout(() => {
            selectionRectRef.current.visible(false);
        });

        const objects = stageRef.current.find((value) => isObject(value));
        const box = selectionRectRef.current.getClientRect();
        const selected = objects.filter((object) => {
            return Util.haveIntersection(box, object.getClientRect());
        });
        transformerRef.current.nodes(selected);
        uiStore.canvasControls.transformerNodes = selected;
    });

    const onStageClick = action((event) => {
        if (selectionRectRef.current.visible()) {
            return;
        }
        if (isBackground(event.target)) {
            transformerRef.current.nodes([]);
            uiStore.canvasControls.transformerNodes = [];
            return;
        }
        if (!isObject(event.target)) {
            return;
        }

        const metaPressed = event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey;
        const isSelected = transformerRef.current.nodes().indexOf(event.target) >= 0;

        if (!metaPressed && !isSelected) {
            // if no key pressed and the node is not selected
            // select just one
            transformerRef.current.nodes([event.target]);
            uiStore.canvasControls.transformerNodes = [event.target];
        } else if (metaPressed && isSelected) {
            // if we pressed keys and node was selected
            // we need to remove it from selection:
            const nodes = transformerRef.current.nodes().slice(); // use slice to have new copy of array
            // remove node from array
            nodes.splice(nodes.indexOf(event.target), 1);
            transformerRef.current.nodes(nodes);
            uiStore.canvasControls.transformerNodes = nodes;
        } else if (metaPressed && !isSelected) {
            // add the node into selection
            const nodes = transformerRef.current.nodes().concat([event.target]);
            transformerRef.current.nodes(nodes);
            uiStore.canvasControls.transformerNodes = nodes;
        }
    });

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
            <Stage
                ref={stageRef}
                width={uiStore.canvasSize.width}
                height={uiStore.canvasSize.height}
                onMouseDown={onStageMouseDown}
                onMouseMove={onStageMouseMove}
                onMouseUp={onStageMouseUp}
                onClick={onStageClick}
            >
                <Layer>
                    <Rect
                        x={0}
                        y={0}
                        width={uiStore.canvasSize.width}
                        height={uiStore.canvasSize.height}
                        fill={"red"}
                        name={uiStore.backgroundName}
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
                        fill={"black"}
                        scaleX={1}
                        scaleY={1}
                        name={uiStore.backgroundName}
                    />
                </Layer>
				{/* {
					domainStore.videos.map((video) => {
						return (
							<Layer
								scaleX={uiStore.canvasScale}
								scaleY={uiStore.canvasScale}
								offsetX={uiStore.canvasSize.width / 2}
								offsetY={uiStore.canvasSize.height / 2}
								x={uiStore.canvasSize.width / 2}
								y={uiStore.canvasSize.height / 2}
							>
								<DraggableVideo curVideo={video} />
							</Layer>);
					})
				}
				{
					domainStore.texts.map((text) => {
						return (
						<Layer
							scaleX={uiStore.canvasScale}
							scaleY={uiStore.canvasScale}
							offsetX={uiStore.canvasSize.width / 2}
							offsetY={uiStore.canvasSize.height / 2}
							x={uiStore.canvasSize.width / 2}
							y={uiStore.canvasSize.height / 2}
						>
							<DraggableText curText={text} />
						</Layer>);
					})
				} */}
				<Layer
					scaleX={uiStore.canvasScale}
					scaleY={uiStore.canvasScale}
					offsetX={uiStore.canvasSize.width / 2}
					offsetY={uiStore.canvasSize.height / 2}
					x={uiStore.canvasSize.width / 2}
					y={uiStore.canvasSize.height / 2}
				>
					{
						domainStore.videos.map((video) => <DraggableVideo 
							key={video.commonState.id}
							curVideo={video} 
						/>)
					}
					{
						domainStore.texts.map((text) => <DraggableText
							key={text.commonState.id}
							curText={text} 
						/>)
					}
				</Layer>
                <Layer>
                    <Transformer
                        ref={transformerRef}
                        rotateAnchorOffset={60}
                        enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                    />
                    <Rect ref={selectionRectRef} fill={"rgba(0, 0, 255, 0.4"} visible={false} />
                </Layer>
            </Stage>
        </>
    );
});

export default EditorCanvas;
