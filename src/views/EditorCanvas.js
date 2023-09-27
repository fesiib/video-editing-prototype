import React, { useEffect, useMemo, useRef, useState } from "react";

import { action, autorun, reaction, toJS } from "mobx";
import { observer } from "mobx-react-lite";

import { Layer, Rect, Stage, Transformer, Group } from "react-konva";

import useRootContext from "../hooks/useRootContext";
import { Util } from "konva/lib/Util";
import DraggableVideo from "../components/canvas/DraggableVideo";
import CanvasItem from "../components/canvas/CanvasItem";

const EditorCanvas = observer(function EditorCanvas() {
    const stageRef = useRef(null);
	const videoLayerRef = useRef(null);
	const objectsLayerRef = useRef(null);
	const videoGroupRef = useRef(null);
	const objectsGroupRef = useRef(null);
    const transformerRef = useRef(null);
    const selectionRectRef = useRef(null);

    const [selectionRectCoordinates, setSelectionRectCoordinates] = useState([0, 0, 0, 0]);

    const { uiStore, domainStore } = useRootContext();

	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
    const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const videos = domainStore.videos;

	const orderedObjects = domainStore.orderedAllObjects;

	const onCursorStyleChange = (cursorStyle) => {
		console.log(cursorStyle);
		if (stageRef.current !== null) {
			stageRef.current.container().style.cursor = cursorStyle;
		}
	};

	const onZoomChange = action((event) => {
        uiStore.canvasControls.scalePos = event.target.value;
		uiStore.logData("canvasZoomChange", null);
    });

	const isObject = (target) => {
		const object = domainStore.curIntent.getCanvasObjectById(target.id());
		if (object === undefined || object === null 
		) {
			return false;
		}
        return true;
	}

    const isVisibleObject = (target) => {
		const object = domainStore.curIntent.getCanvasObjectById(target.id());
		if (object === undefined || object === null 
		) {
			return false;
		}
		if (!object.isVisible(uiStore.timelineControls.playPosition)) {
			return false;
		}
        for (let i in uiStore.objectNames) {
            const objectName = uiStore.objectNames[i];
            if (objectName === target.name()) {
                return true;
            }
        }
        return false;
    };

    const isBackground = (target) => {
		if (target === null || target === undefined) {
			return false;
		}
        return target.name() === uiStore.backgroundName || (
			!isVisibleObject(target) && isObject(target)
		);
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
		uiStore.selectCanvasObjects([]);
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

        const objects = stageRef.current.find((value) => isVisibleObject(value));
        const box = selectionRectRef.current.getClientRect();
        const selected = objects.filter((object) => {
            return Util.haveIntersection(box, object.getClientRect());
        });
		uiStore.selectCanvasObjects(selected);
		uiStore.logData("canvasBatchSelect", {
			count: selected.length,
		});
    });

    const onStageClick = action((event) => {
        if (selectionRectRef.current.visible()) {
            return;
        }
        if (isBackground(event.target)) {
			uiStore.selectCanvasObjects([]);
            return;
        }
		// if (event.target.name() === uiStore.objectNames.video
		// 	&& domainStore.curIntent.editOperationKey === uiStore.objectNames.crop
		// ) {
		// 	uiStore.selectCanvasObjects([event.target]);
        //     return;
		// }
		if (!isVisibleObject(event.target)) {
			uiStore.selectCanvasObjects([]);
            return;
		}


        const metaPressed = event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey;
        const isSelected = transformerRef.current.nodes().indexOf(event.target) >= 0;

        if (!metaPressed && !isSelected) {
            // if no key pressed and the node is not selected
            // select just one
			uiStore.selectCanvasObjects([event.target]);
			uiStore.logData("canvasSingleSelect", null);
        } else if (metaPressed && isSelected) {
            // if we pressed keys and node was selected
            // we need to remove it from selection:
            const nodes = transformerRef.current.nodes().slice(); // use slice to have new copy of array
            // remove node from array
            nodes.splice(nodes.indexOf(event.target), 1);
			uiStore.selectCanvasObjects(nodes);
        } else if (metaPressed && !isSelected) {
            // add the node into selection
            const nodes = transformerRef.current.nodes().concat([event.target]);
			uiStore.logData("canvasBatchSelect", {
				count: nodes.length,
			});
			uiStore.selectCanvasObjects(nodes);
        }
    });

    useEffect(
        action(() => {
            const minWindowHeight = canvasHeight - uiStore.canvasConst.margin;
            const minWindowWidth = canvasWidth - uiStore.canvasConst.margin;
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

	useEffect(() => reaction(() => {
		return{
			nodeIds: uiStore.canvasControls.transformerNodeIds,
			editOperationKey: domainStore.curIntent.editOperationKey,
		}
	}, 
		({ nodeIds }) => {
			let nodes = [];
			for (let nodeId of nodeIds) {
				const object = domainStore.curIntent.getCanvasObjectById(nodeId);
				const node = stageRef.current.findOne(`#${nodeId}`);
				if (node === undefined) {
					continue;
				}
				// if (domainStore.curIntent.editOperationKey === uiStore.objectNames.crop) {
				// 	if (object === undefined && domainStore.getVideoById(nodeId) !== undefined) {
				// 		nodes.push(node);
				// 	}
				// 	continue;
				// }
				if (object !== undefined &&
					object.isVisible(uiStore.timelineControls.playPosition)) {
					nodes.push(node);
				}
			}
			transformerRef.current.nodes(nodes);
		}
	), []);

	useEffect(() => {
        const opacity = uiStore.canvasControls.opacity;
        const filterOpacity = `opacity(${opacity * 100}%)`;
		if (videoLayerRef.current !== null) {
			const canvasVideo = videoLayerRef.current.getCanvas()._canvas;
			canvasVideo.style.filter = `${filterOpacity}`;
		}
		if (objectsLayerRef.current !== null) {
			const canvasObjects = objectsLayerRef.current.getCanvas()._canvas;
			canvasObjects.style.filter = `${filterOpacity}`;
		}
    }, [
		videoLayerRef.current,
		objectsLayerRef.current,
		uiStore.canvasControls.opacity,
	]);

	useEffect(() => autorun(() => {
		if (transformerRef.current === null) {
			return;
		}
		if (uiStore.timelineControls.selectedTimelineItems.length > 0
			&& uiStore.timelineControls.selectedTimelineItems[0].isSuggested
		) {
			transformerRef.current.anchorStroke("yellow");
			transformerRef.current.anchorStrokeWidth(3);
			transformerRef.current.borderStroke("yellow");
			transformerRef.current.borderStrokeWidth(3);
			// transformerRef.current.findOne(".rotater").on("mouseenter", () => onCursorStyleChange("default"));
			// transformerRef.current.findOne(".rotater").on("mouseleave", () => onCursorStyleChange("default"));
		}
		else {
			transformerRef.current.anchorStroke("blue");
			transformerRef.current.anchorStrokeWidth(1);
			transformerRef.current.borderStroke("blue");
			transformerRef.current.borderStrokeWidth(1);
			// transformerRef.current.findOne(".rotater").on("mouseenter", () => onCursorStyleChange("pointer"));
			// transformerRef.current.findOne(".rotater").on("mouseleave", () => onCursorStyleChange("default"));
		}
		return () => {
			if (transformerRef.current === null) {
				return;
			}
			// transformerRef.current.findOne(".rotater").off("mouseenter");
			// transformerRef.current.findOne(".rotater").off("mouseleave");
		};
	}), []);


    return (
        <>
			<div className="flex flex-row justify-end w-full">
				<div className="flex flex-row mx-2 items-center">
					<label htmlFor="canvas_zoom"
						className="whitespace-nowrap"
					> Canvas Zoom: {uiStore.canvasZoom}%  </label>
					<input
						className="mx-2"
						id="canvas_zoom"
						type={"range"}
						min={0}
						max={10}
						value={uiStore.canvasControls.scalePos}
						onChange={onZoomChange}
					/>
				</div>
			</div>
            <Stage
                ref={stageRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={onStageMouseDown}
                onMouseMove={onStageMouseMove}
                onMouseUp={onStageMouseUp}
                onClick={onStageClick}
            >
                <Layer>
                    <Rect
                        x={0}
                        y={0}
                        width={canvasWidth}
                        height={canvasHeight}
                        fill={"transparent"}
                        name={uiStore.backgroundName}
                    />
                </Layer>
				<Layer
                    scaleX={uiStore.canvasScale}
                    scaleY={uiStore.canvasScale}
                    offsetX={canvasWidth / 2}
                    offsetY={canvasHeight / 2}
                    x={canvasWidth / 2}
                    y={canvasHeight / 2}
                >
					<Group
						clipX={canvasWidth / 2 - projectWidth / 2 - 5}
						clipY={canvasHeight / 2 - projectHeight / 2 - 5}
						clipWidth={projectWidth + 10}
						clipHeight={projectHeight + 10}
					>
						<Rect
							x={canvasWidth / 2}
							y={canvasHeight / 2}
							width={projectWidth}
							height={projectHeight}
							offsetX={projectWidth / 2}
							offsetY={projectHeight / 2}
							fill={"black"}
							scaleX={1}
							scaleY={1}
							name={uiStore.backgroundName}
							// shadowColor={"black"}
							// shadowOffset={{x: 10, y: 10}}
							// shadowOpacity={0.5}
							// shadowBlur={10}
							stroke="black"
							strokeWidth={1}
						/>
					</Group>
				</Layer>
                <Layer
					ref={videoLayerRef}
                    scaleX={uiStore.canvasScale}
                    scaleY={uiStore.canvasScale}
                    offsetX={canvasWidth / 2}
                    offsetY={canvasHeight / 2}
                    x={canvasWidth / 2}
                    y={canvasHeight / 2}
                >
					<Group
						clipX={canvasWidth / 2 - projectWidth / 2}
						clipY={canvasHeight / 2 - projectHeight / 2}
						clipWidth={projectWidth}
						clipHeight={projectHeight}
						shadowColor={"black"}
						shadowBlur={10}
						shadowOpacity={0.5}
						shadowOffsetX={5}
						shadowOffsetY={5}
					>
						<Group
							ref={videoGroupRef}
							scaleX={1}
							scaleY={1}
							x={0}
							y={0}
						>
							{videos.map((video) => (
								<DraggableVideo key={video.commonState.id} curVideo={video} />
							))}
						</Group>
					</Group>
                </Layer>
				<Layer
					ref={objectsLayerRef}
                    scaleX={uiStore.canvasScale}
                    scaleY={uiStore.canvasScale}
                    offsetX={canvasWidth / 2}
                    offsetY={canvasHeight / 2}
                    x={canvasWidth / 2}
                    y={canvasHeight / 2}
                >
					<Group
						clipX={canvasWidth / 2 - projectWidth / 2}
						clipY={canvasHeight / 2 - projectHeight / 2}
						clipWidth={projectWidth}
						clipHeight={projectHeight}
					>
						<Group
							ref={objectsGroupRef}
							scaleX={1}
							scaleY={1}
							x={0}
							y={0}
						>
							{orderedObjects.map((item) => {
								return (<CanvasItem 
									key={item.commonState.id}
									item={item}
									stageRef={stageRef.current}
									transformerRef={transformerRef.current}
									videoGroupRef={videoGroupRef.current}
									objectsGroupRef={objectsGroupRef.current}
								/>)
							})}
						</Group>
					</Group>
                </Layer>
				{/* <Layer
                    scaleX={uiStore.canvasScale}
                    scaleY={uiStore.canvasScale}
                    offsetX={canvasWidth / 2}
                    offsetY={canvasHeight / 2}
                    x={canvasWidth / 2}
                    y={canvasHeight / 2}
                >
                    
                </Layer> */}
                <Layer>
                    <Transformer
                        ref={transformerRef}
                        rotateAnchorOffset={60}
                        enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
						rotationSnaps={[0, 45, 90, 135, 180, 225, 270]}
						keepRatio={false}
						boundBoxFunc={(oldBox, newBox) => {
							if (newBox.width < uiStore.canvasConst.minWidth
								|| newBox.height < uiStore.canvasConst.minHeight	
							) {
							  	return oldBox;
							}
							return newBox;
						}}
						flipEnabled={false}
						anchorStroke="blue"
						anchorStrokeWidth={1}
						borderStroke="blue"
                    />
                    <Rect ref={selectionRectRef} fill={"rgba(0, 0, 255, 0.4"} visible={false} />
                </Layer>
            </Stage>
        </>
    );
});

export default EditorCanvas;
