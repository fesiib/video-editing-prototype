import { observer } from "mobx-react-lite";
import React from "react";
import useRootContext from "../../hooks/useRootContext";
import DraggableText from "./DraggableText";
import DraggableVideo from "./DraggableVideo";

const CanvasItem = observer(function CanvasItem({ item, type }) {
	const { uiStore } = useRootContext();

	const left = item.commonState.offset;
	const right = item.commonState.end;
	const playPosition = uiStore.timelineControls.playPosition;
	if (left <= playPosition && right >= playPosition) {
		if (type === 'video') {
			return <DraggableVideo curVideo={item} />
		}
		if (type === 'text') {
			return <DraggableText curText={item} />
		}
	}
	return null;
});

export default CanvasItem;