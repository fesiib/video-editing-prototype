import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { Rect, Circle, Star } from "react-konva";

import useRootContext from "../../hooks/useRootContext";
import { adaptCoordinate } from "../../utilities/genericUtilities";


const DraggableShape = observer(function DraggableShape({ curShape }) {
    const { uiStore, domainStore } = useRootContext();

    const shapeRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curShape.isVisible(uiStore.timelineControls.playPosition);
	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(curShape.commonState.x, curShape.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(curShape.commonState.y, curShape.commonState.height, projectHeight, canvasHeight);

    useEffect(action(() => {
		if (shapeRef.current === null) {
			return;
		}
		if (!isVisible) {
			uiStore.removeSelectedCanvasObject(shapeRef.current.id());
		}
		else if (
			uiStore.timelineControls.selectedTimelineItems.findIndex(
				(item) => (item.commonState.id === shapeRef.current.id())
			) >= 0
			&& 	uiStore.timelineControls.selectedTimelineItems.length === 1
		) {
			uiStore.addSelectedCanvasObject(shapeRef.current.id());
		}
    }), [
		isVisible,
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

    useEffect(action(() => {
		if (shapeRef.current === null) {
			return;
		}
 		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(shapeRef.current.id()) >= 0);
    }), [
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);

    return curShape.title !== domainStore.editOperations[uiStore.objectNames.shape].title ? null : (<>
		<Rect
			id={curShape.commonState.id + "_bg"}
			name={uiStore.objectNames.shape}
			x={x}
			y={y}
			width={curShape.commonState.width}
			height={curShape.commonState.height}
			offsetX={curShape.commonState.width / 2}
			offsetY={curShape.commonState.height / 2}
			scaleX={curShape.commonState.scaleX}
			scaleY={curShape.commonState.scaleY}
			rotation={curShape.commonState.rotation}
			fill={curShape.customParameters.background.fill}
			opacity={curShape.customParameters.background.alpha}
			draggable={isSelected}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
		/>
		<Rect 
			id={curShape.commonState.id}
			name={uiStore.objectNames.shape}
			ref={shapeRef}
			x={x}
			y={y}
			width={curShape.commonState.width}
			height={curShape.commonState.height}
			offsetX={curShape.commonState.width / 2}
			offsetY={curShape.commonState.height / 2}
			scaleX={curShape.commonState.scaleX}
			scaleY={curShape.commonState.scaleY}
			rotation={curShape.commonState.rotation}
			stroke={curShape.customParameters.stroke.fill}
			strokeWidth={curShape.customParameters.stroke.width}
			opacity={curShape.customParameters.stroke.alpha}
			draggable={isSelected}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
		/>
	</>);
});

export default DraggableShape;
