import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, toJS } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Rect } from "react-konva";
import { adaptCoordinate } from "../../utilities/genericUtilities";

const CropConfig = observer(function CropConfig({ crop }) {
	const { uiStore, domainStore } = useRootContext();

	const cropTitleConst = domainStore.editOperations[uiStore.objectNames.crop].title;

	const cropFgRef = useRef(null);
	const cropBgRef = useRef(null);

	const [isSelectedFg, setIsSelectedFg] = useState(false);
	const [isSelectedBg, setIsSelectedBg] = useState(false);

	const isVisible = crop.isVisible(uiStore.timelineControls.playPosition);
	const isActive = crop.isActive;
	const isSuggested = crop.isSuggested;

	const mainVideos = domainStore.videos.filter((video) => {
		const left = Math.max(video.commonState.offset, crop.commonState.offset);
		const right = Math.min(video.commonState.end, crop.commonState.end);
		return left < right;
	});

	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(crop.customParameters.x, crop.customParameters.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(crop.customParameters.y, crop.customParameters.height, projectHeight, canvasHeight);

	const cropX = adaptCoordinate(crop.customParameters.cropX, crop.customParameters.cropWidth, projectWidth, canvasWidth);
	const cropY = adaptCoordinate(crop.customParameters.cropY, crop.customParameters.cropHeight, projectHeight, canvasHeight);

	// foreground isSelected
	useEffect(action(() => {
		if (cropFgRef.current === null) {
			return;
		}
		setIsSelectedFg(uiStore.canvasControls.transformerNodeIds.indexOf(cropFgRef.current.id()) >= 0);
    }), [
		cropFgRef.current,
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);

	// background isSelected
	useEffect(action(() => {
		if (cropBgRef.current === null) {
			return;
		}
		setIsSelectedBg(uiStore.canvasControls.transformerNodeIds.indexOf(cropBgRef.current.id()) >= 0);
    }), [
		cropBgRef.current,
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);

	useEffect(action(() => {
		if (cropFgRef.current === null || cropBgRef.current === null) {
			return;
		}
		if (!isVisible) {
			uiStore.removeSelectedCanvasObject(cropFgRef.current.id());
			uiStore.removeSelectedCanvasObject(cropBgRef.current.id());
		}
		else if (
			uiStore.timelineControls.selectedTimelineItems.findIndex(
				(item) => (item.commonState.id === crop.commonState.id)
			) >= 0
			&& 	uiStore.timelineControls.selectedTimelineItems.length === 1
			&& uiStore.canvasControls.transformerNodeIds.length === 0
		) {
			uiStore.addSelectedCanvasObject(cropFgRef.current.id());
		}
    }), [
		isVisible,
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

	useEffect(action(() => {
		if (cropFgRef.current === null || cropBgRef.current === null) {
			return;
		}
		if (!isVisible) {
			return;
		}
		for (const video of mainVideos) {
			let cropMetadata = {};
			if ((!isSelectedFg && !isSelectedBg) || uiStore.timelineControls.isPlaying) {
				const scaleX = crop.customParameters.width / domainStore.projectMetadata.width;
				const scaleY = crop.customParameters.height / domainStore.projectMetadata.height;
				const originalX = video.commonState.originalWidth / domainStore.projectMetadata.width;
				const originalY = video.commonState.originalHeight / domainStore.projectMetadata.height;

				cropMetadata = {
					x: crop.customParameters.cropX,
					y: crop.customParameters.cropY,
					width: crop.customParameters.cropWidth,
					height: crop.customParameters.cropHeight,
					cropX: (crop.customParameters.cropX - crop.customParameters.x) * originalX / scaleX,
					cropY: (crop.customParameters.cropY - crop.customParameters.y) * originalY / scaleY,
					cropWidth: crop.customParameters.cropWidth * originalX / scaleX,
					cropHeight: crop.customParameters.cropHeight * originalY / scaleY,
				};
			}
			video.commonState.setMetadata({
				updateAuthorCrop: crop.commonState.id,
				cropped: true,
				x: crop.customParameters.x,
				y: crop.customParameters.y,
				width: crop.customParameters.width,
				height: crop.customParameters.height,
				...cropMetadata,
			});
		}
		return action(() => {
			for (const video of mainVideos) {
				if (video.commonState.updateAuthorCrop !== crop.commonState.id) {
					continue;
				}
				video.commonState.setMetadata({
					updateAuthorCrop: null,
					cropped: false,
					x: 0,
					y: 0,
					width: domainStore.projectMetadata.width,
					height: domainStore.projectMetadata.height,
					cropX: 0,
					cropY: 0,
					cropWidth: video.commonState.originalWidth,
					cropHeight: video.commonState.originalHeight,
				});
			}
		});
	}), [
		isSelectedFg,
		isSelectedBg,
		crop.customParameters?.x,
		crop.customParameters?.y,
		crop.customParameters?.width,
		crop.customParameters?.height,
		crop.customParameters?.cropX,
		crop.customParameters?.cropY,
		crop.customParameters?.cropWidth,
		crop.customParameters?.cropHeight,
		isVisible,
		mainVideos.length,
		uiStore.timelineControls.isPlaying,
	]);

	return (crop.title !== cropTitleConst || crop.customParameters.cropX === undefined) ? null : (<>
		<Rect 
			id={"bg_" + crop.commonState.id}
			name={uiStore.objectNames.crop}
			ref={cropBgRef}
			x={x}
			y={y}
			width={crop.customParameters.width}
			height={crop.customParameters.height}
			offsetX={crop.customParameters.width / 2}
			offsetY={crop.customParameters.height / 2}
			scaleX={crop.commonState.scaleX}
			scaleY={crop.commonState.scaleY}
			rotation={crop.commonState.rotation}
			stroke={"blue"}
			strokeWidth={isVisible && isActive ? 4 : 0}
			//opacity={crop.customParameters.background.alpha}
			draggable={!isSuggested && (isSelectedBg && !isSelectedFg)}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => crop.commonState.onDragMove(event.target))}
			onTransform={action((event) => crop.commonState.onTransform(event.target))}
		/>
		<Rect 
			id={"fg_" + crop.commonState.id}
			name={uiStore.objectNames.crop}
			ref={cropFgRef}
			x={cropX}
			y={cropY}
			width={crop.customParameters.cropWidth}
			height={crop.customParameters.cropHeight}
			offsetX={crop.customParameters.cropWidth / 2}
			offsetY={crop.customParameters.cropHeight / 2}
			scaleX={crop.commonState.scaleX}
			scaleY={crop.commonState.scaleY}
			rotation={crop.commonState.rotation}
			stroke={"red"}
			strokeWidth={isVisible && isActive ? 2 : 0}
			draggable={!isSuggested && (isSelectedFg && !isSelectedBg)}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => crop.commonState.onDragMove(event.target))}
			onTransform={action((event) => crop.commonState.onTransform(event.target))}
		/>
	</>);
});

export default CropConfig;