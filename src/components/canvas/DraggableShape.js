import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, reaction, toJS } from "mobx";

import { Rect, Circle, Ellipse, Star } from "react-konva";

import useRootContext from "../../hooks/useRootContext";
import { adaptCoordinate } from "../../utilities/genericUtilities";

const StarShape = observer(function StarShape({
	curShape,
	bgRef,
	shapeRef,
	isSelected,
	isVisible,
	isSuggested,
	x,
	y,
	id,
	shapeName,
	onTransformEnd,
	onDragEnd,
}) {
	if (curShape.customParameters.type !== "star") {
		return null;
	}
	if (curShape.customParameters.star === undefined) {
		return null;
	}
	return (<>
		<Star
			id={id + "_bg"}
			name={shapeName}
			ref={bgRef}
			x={x}
			y={y}
			innerRadius={curShape.customParameters.star.innerRadius}
			outerRadius={curShape.commonState.width / 2}
			numPoints={curShape.customParameters.star.numPoints}
			scaleX={curShape.commonState.scaleX}
			scaleY={curShape.commonState.scaleY}
			rotation={curShape.commonState.rotation}
			fill={curShape.customParameters.background.fill}
			opacity={curShape.customParameters.background.alpha}
			//opacity={curShape.customParameters.background.alpha * (isSuggested ? 0.5 : 1)}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
			onTransformEnd={onTransformEnd}
			onDragEnd={onDragEnd}
		/>
		<Star
			id={id}
			name={shapeName}
			ref={shapeRef}
			x={x}
			y={y}
			innerRadius={curShape.customParameters.star.innerRadius}
			outerRadius={curShape.commonState.width / 2}
			numPoints={curShape.customParameters.star.numPoints}
			scaleX={curShape.commonState.scaleX}
			scaleY={curShape.commonState.scaleY}
			rotation={curShape.commonState.rotation}
			stroke={curShape.customParameters.stroke.fill}
			strokeWidth={curShape.customParameters.stroke.width}
			opacity={curShape.customParameters.stroke.alpha}
			//opacity={curShape.customParameters.stroke.alpha * (isSuggested ? 0.5 : 1)}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
			onTransformEnd={onTransformEnd}
			onDragEnd={onDragEnd}
		/>
	</>);
});

const CircleShape = observer(function CircleShape({
	curShape,
	bgRef,
	shapeRef,
	isSelected,
	isVisible,
	isSuggested,
	x,
	y,
	id,
	shapeName,
	onTransformEnd,
	onDragEnd,
}) {
	if (curShape.customParameters.type !== "circle") {
		return null;
	}
	return (<>
		<Ellipse
			id={id + "_bg"}
			name={shapeName}
			ref={bgRef}
			x={x}
			y={y}
			//radius={curShape.customParameters.radius}
			radiusX = {curShape.commonState.width / 2}
			radiusY = {curShape.commonState.height / 2}
			scaleX={curShape.commonState.scaleX}
			scaleY={curShape.commonState.scaleY}
			rotation={curShape.commonState.rotation}
			fill={curShape.customParameters.background.fill}
			opacity={curShape.customParameters.background.alpha}
			//opacity={curShape.customParameters.background.alpha * (isSuggested ? 0.5 : 1)}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
			onTransformEnd={onTransformEnd}
			onDragEnd={onDragEnd}
		/>
		<Ellipse
			id={id}
			name={shapeName}
			ref={shapeRef}
			x={x}
			y={y}
			radiusX = {curShape.commonState.width / 2}
			radiusY = {curShape.commonState.height / 2}
			scaleX={curShape.commonState.scaleX}
			scaleY={curShape.commonState.scaleY}
			rotation={curShape.commonState.rotation}
			stroke={curShape.customParameters.stroke.fill}
			strokeWidth={curShape.customParameters.stroke.width}
			opacity={curShape.customParameters.stroke.alpha}
			//opacity={curShape.customParameters.stroke.alpha * (isSuggested ? 0.5 : 1)}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
			onTransformEnd={onTransformEnd}
			onDragEnd={onDragEnd}
		/>
	</>);
});

const RectangleShape = observer(function RectangleShape({
	curShape,
	bgRef,
	shapeRef,
	isSelected,
	isVisible,
	isSuggested,
	x,
	y,
	id,
	shapeName,
	onTransformEnd,
	onDragEnd,
}) {
	if (curShape.customParameters.type !== "rectangle") {
		return null;
	}
	return (<>
		<Rect
			id={id + "_bg"}
			name={shapeName}
			ref={bgRef}
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
			//opacity={curShape.customParameters.background.alpha * (isSuggested ? 0.5 : 1)}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
			onTransformEnd={onTransformEnd}
			onDragEnd={onDragEnd}
		/>
		<Rect 
			id={id}
			name={shapeName}
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
			//opacity={curShape.customParameters.stroke.alpha * (isSuggested ? 0.5 : 1)}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curShape.commonState.onDragMove(event.target))}
			onTransform={action((event) => curShape.commonState.onTransform(event.target))}
			onTransformEnd={onTransformEnd}
			onDragEnd={onDragEnd}
		/>
	</>);
});

const DraggableShape = observer(function DraggableShape({
	curShape,
	transformerRef,
}) {
    const { uiStore, domainStore } = useRootContext();

	const shapeTitleConst = domainStore.editOperations[uiStore.objectNames.shape].title;

    const shapeRef = useRef(null);
	const bgRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curShape.isVisible(uiStore.timelineControls.playPosition);
	const isSuggested = curShape.isSuggested;

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
				(item) => (item.commonState.id === curShape.commonState.id)
			) >= 0
			&& uiStore.timelineControls.selectedTimelineItems.length === 1
		) {
			uiStore.removeSelectedCanvasObject("re_" + curShape.commonState.id);
			uiStore.removeSelectedCanvasObject("ci_" + curShape.commonState.id);
			uiStore.removeSelectedCanvasObject("st_" + curShape.commonState.id);
			uiStore.addSelectedCanvasObject(shapeRef.current.id());
			if (curShape.customParameters.type === "star") {
				transformerRef.keepRatio(true);
				uiStore.transformerKeepRatioAuthor = curShape.commonState.id;
			}
		}
		return action(() => {
			if (!isVisible) {
				return;
			}
			if (shapeRef.current !== null) {
				//uiStore.removeSelectedCanvasObject(shapeRef.current.id());
			}
			if (uiStore.transformerKeepRatioAuthor === curShape.commonState.id) {
				transformerRef.keepRatio(false);
				uiStore.transformerKeepRatioAuthor = null;
			}
		});
    }), [
		curShape.customParameters.type,
		isVisible,
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

	useEffect(() => reaction(() => {
		return {
			nodeIds: uiStore.canvasControls.transformerNodeIds,
		}
	}, 
		({ nodeIds }) => {
			if (shapeRef.current === null) {
				return;
			}
			setIsSelected(nodeIds.indexOf(shapeRef.current.id()) >= 0);
		}
	), []);

	if (curShape.title !== shapeTitleConst || curShape.customParameters.type === undefined) {
		return null;
	}
	if (curShape.customParameters.type === "rectangle") {
		return (<RectangleShape
			curShape={curShape}
			bgRef={bgRef}
			shapeRef={shapeRef}
			isSelected={isSelected}
			isVisible={isVisible}
			isSuggested={isSuggested}
			x={x}
			y={y}
			id={"re_" + curShape.commonState.id}
			shapeName={uiStore.objectNames.shape}
			onTransformEnd={action((event) => {
				uiStore.logData("canvasObjectTransformed", {
					id: curShape.commonState.id,
					objectType: "shape",
					type: "rectangle",
				});
			})}
			onDragEnd={action((event) => {
				uiStore.logData("canvasObjectDragged", {
					id: curShape.commonState.id,
					objectType: "shape",
					type: "rectangle",
				});
			})}
		/>);
	}
	if (curShape.customParameters.type === "circle") {
		return (<CircleShape
			curShape={curShape}
			bgRef={bgRef}
			shapeRef={shapeRef}
			isSelected={isSelected}
			isVisible={isVisible}
			isSuggested={isSuggested}
			x={x}
			y={y}
			id={"ci_" + curShape.commonState.id}
			shapeName={uiStore.objectNames.shape}
			onTransformEnd={action((event) => {
				uiStore.logData("canvasObjectTransformed", {
					id: curShape.commonState.id,
					objectType: "shape",
					type: "circle",
				});
			})}
			onDragEnd={action((event) => {
				uiStore.logData("canvasObjectDragged", {
					id: curShape.commonState.id,
					objectType: "shape",
					type: "circle",
				});
			})}
		/>);
	}
	if (curShape.customParameters.type === "star") {
		return (<StarShape
			curShape={curShape}
			bgRef={bgRef}
			shapeRef={shapeRef}
			isSelected={isSelected}
			isVisible={isVisible}
			isSuggested={isSuggested}
			x={x}
			y={adaptCoordinate(curShape.commonState.y, curShape.commonState.width, projectHeight, canvasHeight)}
			id={"st_" + curShape.commonState.id}
			shapeName={uiStore.objectNames.shape}
			onTransformEnd={action((event) => {
				uiStore.logData("canvasObjectTransformed", {
					id: curShape.commonState.id,
					objectType: "shape",
					type: "star",
				});
			})}
			onDragEnd={action((event) => {
				uiStore.logData("canvasObjectDragged", {
					id: curShape.commonState.id,
					objectType: "shape",
					type: "star",
				});
			})}
		/>);
	}
	return null;
});

export default DraggableShape;
