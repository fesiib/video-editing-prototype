import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { Text } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

const DraggableText = observer(function DraggableText({ curText }) {
    const { uiStore } = useRootContext();

    const textRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curText.commonState.isVisible(uiStore.timelineControls.playPosition);

    useEffect(action(() => {
		if (!isVisible) {
			uiStore.removeSelectedCanvasObject(textRef.current.id());
		}
		else if (
			uiStore.timelineControls.selectedTimelineItems.findIndex(
				(item) => (item.commonState.id === textRef.current.id())
			) >= 0
			&& 	uiStore.timelineControls.selectedTimelineItems.length === 1
		) {
			uiStore.addSelectedCanvasObject(textRef.current.id());
		}
    }), [
		isVisible,
		uiStore.timelineControls.selectedTimelineItems,
	]);

    useEffect(action(() => {
		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(textRef.current.id()) >= 0);
    }), [
		uiStore.canvasControls.transformerNodeIds
	]);


    return (
        <Text
			id={curText.commonState.id}
            name={uiStore.objectNames.text}
            ref={textRef}
            text={curText.customParameters.content}
            {...curText.customParameters.style}
            x={curText.commonState.x}
            y={curText.commonState.y}
            width={curText.commonState.width}
            height={curText.commonState.height}
            offsetX={curText.commonState.width / 2}
            offsetY={curText.commonState.height / 2}
            scaleX={curText.commonState.scaleX}
            scaleY={curText.commonState.scaleY}
            draggable={isSelected}
            visible={isVisible}
            perfectDrawEnabled={false}
            onDragEnd={(event) => curText.commonState.onDragEnd(event.target)}
            onTransformEnd={(event) => curText.commonState.onTransformerEnd(event.target)}
        />
    );
});

export default DraggableText;
