import React, { useEffect, useRef } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Animation } from "konva/lib/Animation";

const BlurConfig = observer(function BlurConfig({ blur }) {
	const { uiStore, domainStore } = useRootContext();

	const blurTitleConst = domainStore.editOperations[uiStore.objectNames.blur].title;

	const blurRef = useRef(null);

	const isVisible = blur.isVisible(uiStore.timelineControls.playPosition);
	const mainVideos = domainStore.videos.filter((video) => {
		const left = Math.max(video.commonState.offset, blur.commonState.offset);
		const right = Math.min(video.commonState.end, blur.commonState.end);
		return left < right;
	});

	useEffect(action(() => {
		if (!isVisible || blur.title !== blurTitleConst) {
			return;
		}
		for (const video of mainVideos) {
			video.commonState.setMetadata({
				updateAuthorBlur: blur.commonState.id,
				filterMap: {
					blur: blur.customParameters.blur,
				}
			});
		}
		return action(() => {
			for (const video of mainVideos) {
				if (video.commonState.updateAuthorBlur !== blur.commonState.id) {
					continue;
				}
				video.commonState.setMetadata({
					updateAuthorBlur: null,
					filterMap: {
						blur: 0,
					}
				});
			}
		});
	}), [
		isVisible,
		blur.customParameters?.blur,
		mainVideos.length,
	]);

	return <></>;
});

export default BlurConfig;