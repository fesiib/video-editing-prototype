import React, { useEffect, useRef } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Animation } from "konva/lib/Animation";

const SkippedConfig = observer(function SkippedConfig({ skipped }) {
	const { uiStore, domainStore } = useRootContext();

	const skippedRef = useRef(null);

	const isVisible = skipped.commonState.isVisible(uiStore.timelineControls.playPosition);
	const mainVideos = domainStore.videos.filter((video) => {
		const left = Math.max(video.commonState.offset, skipped.commonState.offset);
		const right = Math.min(video.commonState.end, skipped.commonState.end);
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
		if (uiStore.timelineControls.isPlaying) {
			uiStore.timelineControls.playPosition = skipped.commonState.end;	
		}
		else {
			uiStore.timelineControls.playPosition = skipped.commonState.end;
			// for (const video of mainVideos) {
			// 	video.commonState.setMetadata({
			// 		filterMap: {
			// 			blur: 0.6,
			// 			opacity: 0.2,
			// 		}
			// 	});
			// }
		}
	}), [
		isVisible,
		uiStore.timelineControls.playPosition,
		uiStore.timelineControls.isPlaying,
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

export default SkippedConfig;