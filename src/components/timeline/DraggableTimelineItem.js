import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import { preventCollision, timlineItemMiddle } from "../../utilities/timelineUtilities";

const DraggableTimelineItem = observer(function DraggableTimelineItem({ scene, scenes }) {
	const { uiStore } = useRootContext();

	const { 
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging
	} = useDraggable({
        id: scene.commonState.id,
        data: {
            type: "scene",
            scene,
        },
    });

	let adjustedTransform = {
		...transform,
	};

	if (isDragging) {
		const newOffset = preventCollision(scene, scenes, transform, uiStore);
		adjustedTransform = {
			...transform,
			x: uiStore.secToPx(newOffset - scene.commonState.offset),
		};
		// // move items with otherMiddle > middle
		// const middle = timlineItemMiddle(scene, transform, uiStore);
		// const sceneDuration = (scene.commonState.finish - scene.commonState.start);
		// for (let otherScene of scenes) {
		// 	if (otherScene.commonState.id === scene.commonState.id) {
		// 		continue;
		// 	}
		// 	const otherOffset = otherScene.commonState.offset;
		// 	const otherEnd = otherScene.commonState.offset;
		// 	const otherMiddle = (otherEnd + otherOffset) / 2;
			
		// 	if (otherMiddle > middle) {
		// 		const otherSceneDiv = document.getElementById(otherScene.commonState.id);
		// 		console.log(otherSceneDiv, sceneDuration)
		// 		if (otherSceneDiv) {
		// 			otherSceneDiv.style = {
		// 				...otherSceneDiv.style,
		// 				transform: (`translate3d(${
		// 						uiStore.secToPx(otherScene.commonState.offset + sceneDuration)
		// 					}px, ${0}px, ${0}px)`)
		// 			};
		// 		}
		// 	}
		// }
	}

    return (
        <TimelineItem
            ref={setNodeRef}
            scene={scene}
            transform={adjustedTransform}
            isOverlay={false}
            {...attributes}
            {...listeners}
        />
    );
});

export default DraggableTimelineItem;
