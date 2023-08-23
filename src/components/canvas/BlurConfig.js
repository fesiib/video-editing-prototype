import React, { useEffect, useRef } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Animation } from "konva/lib/Animation";

const BlurConfig = observer(function BlurConfig({ skipped }) {
	const { uiStore, domainStore } = useRootContext();

	const skippedRef = useRef(null);

	const isVisible = skipped.isVisible(uiStore.timelineControls.playPosition);
	const mainVideos = domainStore.videos.filter((video) => {
		const left = Math.max(video.commonState.offset, skipped.commonState.offset);
		const right = Math.min(video.commonState.end, skipped.commonState.end);
		return left < right;
	});

	useEffect(action(() => {
		if (!isVisible) {
			return;
		}
		if (uiStore.timelineControls.isPlaying) {
			uiStore.timelineControls.playPosition = skipped.commonState.end;	
		}
		else {
			for (const video of mainVideos) {
				video.commonState.setMetadata({
					updateAuthorCut: skipped.commonState.id,
					filterMap: {
						opacity: 0.2,
					}
				});
			}
		}
		return action(() => {
			for (const video of mainVideos) {
				if (video.commonState.updateAuthorCut !== skipped.commonState.id) {
					continue;
				}
				video.commonState.setMetadata({
					updateAuthorCut: null,
					filterMap: {
						opacity: 1,
					}
				});
			}
		});
	}), [
		isVisible,
		//uiStore.timelineControls.playPosition,
		uiStore.timelineControls.isPlaying,
		mainVideos.length,
	]);

	return <></>;
});

export default BlurConfig;