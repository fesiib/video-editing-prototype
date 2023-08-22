import React, { useEffect, useRef } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";

const CropConfig = observer(function CropConfig({ crop }) {
	const { uiStore, domainStore } = useRootContext();

	const isVisible = crop.commonState.isVisible(uiStore.timelineControls.playPosition);
	const mainVideos = domainStore.videos.filter((video) => {
		const left = Math.max(video.commonState.offset, crop.commonState.offset);
		const right = Math.min(video.commonState.end, crop.commonState.end);
		return left < right;
	});

	// const updateFunc = action((frame) => {
	// 	if (!isVisible) {
	// 		return;
	// 	}
	// 	if (uiStore.timelineControls.isPlaying) {
	// 		uiStore.timelineControls.playPosition = skipped.commonState.end;
	// 	}
	// 	else {
	// 		for (const video of mainVideos) {
	// 			video.commonState.setMetadata({
	// 				filterMap: {
	// 					blur: 0.6,
	// 				}
	// 			});
	// 		}
	// 	}
	// });

	useEffect(action(() => {
		if (!isVisible) {
			return;
		}
		for (const video of mainVideos) {
			video.commonState.setMetadata({
				cropped: true,
				x: crop.customParameters.x,
				y: crop.customParameters.y,
				cropX: crop.customParameters.cropX,
				cropY: crop.customParameters.cropY,
				cropWidth: crop.customParameters.width,
				cropHeight: crop.customParameters.height,
			});
		}
		return action(() => {
			for (const video of mainVideos) {
				video.commonState.setMetadata({
					cropped: false,
					x: 0,
					y: 0,
					cropX: 0,
					cropY: 0,
					cropWidth: domainStore.projectMetadata.width,
					cropHeight: domainStore.projectMetadata.height,
				});
			}
		});
	}), [
		isVisible,
		//uiStore.timelineControls.playPosition,
		//uiStore.timelineControls.isPlaying,
		mainVideos.length,
	]);

	// useEffect(() => {
	// 	if (isVisible) {
	// 		skippedRef.current.start();
	// 	}
	// 	else {
	// 		skippedRef.current.stop();
	// 	}
	// }, [isVisible]);
	// return skipped.title !== domainStore.editOperations[uiStore.objectNames.cut].title ? null : (<>
	// 	<Animation
	// 		ref={skippedRef}
	// 		frameRate={24}
	// 		frameFunc={updateFunc}
	// 	/>
	// </>);
	return <></>;
});

export default CropConfig;