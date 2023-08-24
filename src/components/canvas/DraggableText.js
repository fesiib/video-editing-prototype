import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { Rect, Text } from "react-konva";

import useRootContext from "../../hooks/useRootContext";
import { adaptCoordinate } from "../../utilities/genericUtilities";


const DraggableText = observer(function DraggableText({ curText }) {
    const { uiStore, domainStore } = useRootContext();

	const textTitleConst = domainStore.editOperations[uiStore.objectNames.text].title;

    const textRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curText.isVisible(uiStore.timelineControls.playPosition);
	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(curText.commonState.x, curText.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(curText.commonState.y, curText.commonState.height, projectHeight, canvasHeight);

    useEffect(action(() => {
		if (textRef.current === null) {
			return;
		}
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
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

    useEffect(action(() => {
		if (textRef.current === null) {
			return;
		}
 		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(textRef.current.id()) >= 0);
    }), [
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);

    return curText.title !== textTitleConst ? null : (<>
		<Rect 
			id={curText.commonState.id + "_background"}
			name={uiStore.objectNames.text + "_background"}
			x={x}
			y={y}
			width={curText.commonState.width}
			height={curText.commonState.height}
			offsetX={curText.commonState.width / 2}
			offsetY={curText.commonState.height / 2}
			scaleX={curText.commonState.scaleX}
			scaleY={curText.commonState.scaleY}
			rotation={curText.commonState.rotation}
			fill={curText.customParameters.background.fill}
			opacity={curText.customParameters.background.alpha}
			draggable={isSelected}
			visible={isVisible}
			perfectDrawEnabled={false}
			onDragMove={action((event) => curText.commonState.onDragMove(event.target))}
			onTransform={action((event) => curText.commonState.onTransform(event.target))}
		/>
		<Text
			id={curText.commonState.id}
            name={uiStore.objectNames.text}
            ref={textRef}
            text={curText.customParameters.content}
            {...curText.customParameters.style}
            x={x}
            y={y}
            width={curText.commonState.width}
            height={curText.commonState.height}
            offsetX={curText.commonState.width / 2}
            offsetY={curText.commonState.height / 2}
            scaleX={curText.commonState.scaleX}
            scaleY={curText.commonState.scaleY}
			rotation={curText.commonState.rotation}
            draggable={isSelected}
            visible={isVisible}
            perfectDrawEnabled={false}
            onDragMove={action((event) => curText.commonState.onDragMove(event.target))}
            onTransform={action((event) => curText.commonState.onTransform(event.target))}
        />
	</>);
});

export default DraggableText;
