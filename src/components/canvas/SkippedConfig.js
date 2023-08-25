import React, { useEffect, useRef } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";
import { Animation } from "konva/lib/Animation";

const SkippedConfig = observer(function SkippedConfig({ skipped }) {
	const { uiStore, domainStore } = useRootContext();

	const skippedTitleConst = domainStore.editOperations[uiStore.objectNames.cut].title;

	const skippedRef = useRef(null);

	const isVisible = skipped.isVisible(uiStore.timelineControls.playPosition);

	useEffect(action(() => {
		if (skipped.title !== skippedTitleConst) {
			return;
		}
		if (!isVisible) {
			return;
		}
		if (uiStore.timelineControls.isPlaying) {
			uiStore.timelineControls.playPosition = skipped.commonState.end;	
		}
		else {
			uiStore.canvasControls.opacity = 0.5;
			uiStore.canvasControls.opacityAuthor = skipped.commonState.id;
		}
		return action(() => {
			if (uiStore.canvasControls.opacityAuthor === skipped.commonState.id) {
				uiStore.canvasControls.opacity = 1;
				uiStore.canvasControls.opacityAuthor = null;
			}
		});
	}), [
		isVisible,
		//uiStore.timelineControls.playPosition,
		uiStore.timelineControls.isPlaying,
	]);

	return <></>;
});

export default SkippedConfig;