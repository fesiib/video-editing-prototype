import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Rect } from "react-konva";
import { adaptCoordinate } from "../../utilities/genericUtilities";
import { clear } from "@testing-library/user-event/dist/clear";

const ZoomConfig = observer(function ZoomConfig({ zoom, videoGroupRef, objectsGroupRef }) {
	const { uiStore, domainStore } = useRootContext();
	
	const zoomTitleConst = domainStore.editOperations[uiStore.objectNames.zoom].title;

	const zoomRef = useRef(null);

	const [isSelected, setIsSelected] = useState(false);

	const isVisible = zoom.isVisible(uiStore.timelineControls.playPosition);
	const isActive = zoom.isActive;
	const isSuggested = zoom.isSuggested;

	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(zoom.commonState.x, zoom.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(zoom.commonState.y, zoom.commonState.height, projectHeight, canvasHeight);

	const setZoomParameters = action(() => {
		const playPosition = uiStore.timelineControls.playPosition;
		let durationStart = zoom.customParameters.zoomDurationStart;
		let durationEnd = zoom.customParameters.zoomDurationEnd;
		if (durationStart + durationEnd > zoom.commonState.sceneDuration) {
			return;
		}
		let scaleX = projectWidth / zoom.commonState.width;
		let scaleY = projectHeight / zoom.commonState.height;
		let zoomX = zoom.commonState.x;
		let zoomY = zoom.commonState.y; 
		if (zoom.commonState.offset <= playPosition
			&& zoom.commonState.offset + durationStart > playPosition
			&& durationStart > 0
		) {
			const progress = (playPosition - zoom.commonState.offset) / durationStart;
			scaleX = 1 + (scaleX - 1) * progress;
			scaleY = 1 + (scaleY - 1) * progress;
			zoomX = zoomX * progress;
			zoomY = zoomY * progress;
			// zoom in
		}
		if (zoom.commonState.end > playPosition
			&& zoom.commonState.end - durationEnd <= playPosition	
			&& durationEnd > 0
		) {
			const progress = (zoom.commonState.end - playPosition) / durationEnd;
			scaleX = 1 + (scaleX - 1) * progress;
			scaleY = 1 + (scaleY - 1) * progress;
			zoomX = zoomX * progress;
			zoomY = zoomY * progress;
			// zoom out
		}
		let newX = (1 - scaleX) * (canvasWidth / 2 - projectWidth / 2) - (zoomX * scaleX);
		let newY = (1 - scaleY) * (canvasHeight / 2 - projectHeight / 2) - (zoomY * scaleY);
		videoGroupRef.scaleX(scaleX);
		videoGroupRef.scaleY(scaleY);
		videoGroupRef.x(newX);
		videoGroupRef.y(newY);
		objectsGroupRef.scaleX(scaleX);
		objectsGroupRef.scaleY(scaleY);
		objectsGroupRef.x(newX);
		objectsGroupRef.y(newY);
	});

	useEffect(action(() => {
		if (zoomRef.current === null) {
			return;
		}
		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(zoomRef.current.id()) >= 0);
    }), [
		zoomRef.current,
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);

	useEffect(action(() => {
		if (zoomRef.current === null) {
			return;
		}
		if (!isVisible) {
			uiStore.removeSelectedCanvasObject(zoomRef.current.id());
		}
		else if (
			uiStore.timelineControls.selectedTimelineItems.findIndex(
				(item) => (item.commonState.id === zoom.commonState.id)
			) >= 0
			&& 	uiStore.timelineControls.selectedTimelineItems.length === 1
			&& uiStore.canvasControls.transformerNodeIds.length === 0
		) {
			uiStore.addSelectedCanvasObject(zoomRef.current.id());
		}
    }), [
		isVisible,
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

	useEffect(action(() => {
		if (zoomRef.current === null) {
			return;
		}
		if (!isVisible) {
			return;
		}
		let durationStart = zoom.customParameters.zoomDurationStart;
		let durationEnd = zoom.customParameters.zoomDurationEnd;
		if (durationStart + durationEnd > zoom.commonState.sceneDuration) {
			return;
		}

		let interval = -1;
	
		if (!isSelected) {
			// if (uiStore.timelineControls.isPlaying) {
			// 	interval = setInterval(setZoomParameters, 20);
			// }
			// else {
			// 	setZoomParameters();
			// }
			setZoomParameters();
		}
		else {
			videoGroupRef.scaleX(1);
			videoGroupRef.scaleY(1);
			objectsGroupRef.scaleX(1);
			objectsGroupRef.scaleY(1);

			objectsGroupRef.x(0);
			objectsGroupRef.y(0);
			videoGroupRef.x(0);
			videoGroupRef.y(0);	
		}
		uiStore.canvasControls.zoomAuthor = zoom.commonState.id;
		return action(() => {
			if (interval >= 0) {
				clearInterval(interval);
			}
			if (uiStore.canvasControls.zoomAuthor !== zoom.commonState.id) {
				return;
			}
			uiStore.canvasControls.zoomAuthor = null;
			videoGroupRef.scaleX(1);
			videoGroupRef.scaleY(1);
			objectsGroupRef.scaleX(1);
			objectsGroupRef.scaleY(1);
			objectsGroupRef.x(0);
			objectsGroupRef.y(0);
			videoGroupRef.x(0);
			videoGroupRef.y(0);
		});
	}), [
		zoom.commonState.offset,
		zoom.commonState.end,
		isSelected,
		zoom.customParameters?.zoomDurationStart,
		zoom.customParameters?.zoomDurationEnd,
		//uiStore.timelineControls.isPlaying,
		isVisible,
		uiStore.timelineControls.playPosition,
	]);

	return zoom.title !== zoomTitleConst ? null : (<>
		<Rect 
			id={zoom.commonState.id}
			name={uiStore.objectNames.zoom}
			ref={zoomRef}
			x={x}
			y={y}
			width={zoom.commonState.width}
			height={zoom.commonState.height}
			offsetX={zoom.commonState.width / 2}
			offsetY={zoom.commonState.height / 2}
			scaleX={zoom.commonState.scaleX}
			scaleY={zoom.commonState.scaleY}
			rotation={zoom.commonState.rotation}
			stroke={"red"}
			strokeWidth={isVisible && isActive ? 2 : 0}
			draggable={isSelected && !isSuggested}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => zoom.commonState.onDragMove(event.target))}
			onTransform={action((event) => zoom.commonState.onTransform(event.target))}
		/>
	</>);
});

export default ZoomConfig;