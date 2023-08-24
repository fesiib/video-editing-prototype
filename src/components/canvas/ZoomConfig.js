import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Rect } from "react-konva";
import { adaptCoordinate } from "../../utilities/genericUtilities";

const ZoomConfig = observer(function ZoomConfig({ zoom }) {
	const { uiStore, domainStore } = useRootContext();

	const zoomRef = useRef(null);

	const [isSelected, setIsSelected] = useState(false);

	const isVisible = zoom.isVisible(uiStore.timelineControls.playPosition);
	const isActive = zoom.isActive;

	const mainVideos = domainStore.videos.filter((video) => {
		const left = Math.max(video.commonState.offset, zoom.commonState.offset);
		const right = Math.min(video.commonState.end, zoom.commonState.end);
		return left < right;
	});

	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(zoom.commonState.x, zoom.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(zoom.commonState.y, zoom.commonState.height, projectHeight, canvasHeight);

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
		if (!isVisible) {
			return;
		}
		const playPosition = uiStore.timelineControls.playPosition;
		let durationStart = zoom.customParameters.zoomDurationStart;
		let durationEnd = zoom.customParameters.zoomDurationEnd;

		if (durationStart + durationEnd > zoom.commonState.sceneDuration) {
			return;
		}
		const scaleX = domainStore.projectMetadata.width / zoom.commonState.width;
		const scaleY = domainStore.projectMetadata.height / zoom.commonState.height;
		if (!isSelected) {
			
		}
		else {
			
		}
		// if (zoom.commonState.offset <= playPosition
		// 	&& zoom.commonState.offset + durationStart > playPosition
		// ) {
		// 	// zoom in
		// }
		// if (zoom.commonState.end > playPosition
		// 	&& zoom.commonState.end - durationEnd >= playPosition	
		// ) {
		// 	// zoom out
		// }
		return action(() => {
			for (const video of mainVideos) {
				if (video.commonState.updateAuthorZoom !== zoom.commonState.id) {
					continue;
				}
				video.commonState.setMetadata({
					updateAuthorZoom: null,
					cropped: true,
					x: video.commonState.x,
					y: video.commonState.y,
					width: video.commonState.width,
					height: video.commonState.height,
					cropX: video.commonState.cropX,
					cropY: video.commonState.cropY,
					cropWidth: video.commonState.cropWidth,
					cropHeight: video.commonState.cropHeight,
				});
			}
		});
	}), [
		isSelected,
		zoom.commonState?.x,
		zoom.commonState?.y,
		zoom.commonState?.width,
		zoom.commonState?.height,
		zoom.customParameters?.zoomDurationStart,
		zoom.customParameters?.zoomDurationEnd,
		uiStore.timelineControls.playPosition,
		isVisible,
	]);

	return zoom.title !== domainStore.editOperations[uiStore.objectNames.zoom].title ? null : (<>
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
			draggable={isSelected}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => zoom.commonState.onDragMove(event.target))}
			onTransform={action((event) => zoom.commonState.onTransform(event.target))}
		/>
	</>);
});

export default ZoomConfig;