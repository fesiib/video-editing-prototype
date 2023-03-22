import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat, preventCollisionDrag } from "../../utilities/timelineUtilities";
import { action } from "mobx";

const DraggableTimelineItem = observer(function DraggableTimelineItem({ scene, scenes }) {
    const { uiStore } = useRootContext();

	const isSelected = uiStore.timelineControls.selectedTimelineItems.findIndex(
		(value) => value.commonState.id === scene.commonState.id
	) >= 0;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: scene.commonState.id,
        data: {
            type: "scene",
            scene,
        },
		disabled: !isSelected,
    });

	const onTimelineItemClick = action((event) => {
		event.stopPropagation();
		event.preventDefault();
		console.log(event);
		const index = uiStore.timelineControls.selectedTimelineItems.findIndex(
			(value) => value.commonState.id === scene.commonState.id
		);
		const metaKey = event.metaKey;
		if (index >= 0) {
			if (metaKey) {
				uiStore.timelineControls.selectedTimelineItems = [
					...uiStore.timelineControls.selectedTimelineItems.slice(0, index),
					...uiStore.timelineControls.selectedTimelineItems.slice(index + 1)
				];
			}
			else {
				uiStore.timelineControls.selectedTimelineItems = [
					scene
				];
			}
		}
		else {
			uiStore.timelineControls.selectedTimelineItems = [
				...( metaKey ? uiStore.timelineControls.selectedTimelineItems : [] ),
				scene,
			];
		}
	});


    let adjustedTransform = {
        ...transform,
    };

    if (isDragging && typeof adjustedTransform?.x === "number") {
        const { newOffset, moveOffset, middle } = preventCollisionDrag(
            scene,
            scenes,
            transform,
            uiStore
        );
        adjustedTransform = {
            ...transform,
            x: uiStore.secToPx(newOffset - scene.commonState.offset),
        };
        // move items on the right side
        for (let otherScene of scenes) {
            if (otherScene.commonState.id === scene.commonState.id) {
                continue;
            }
            const otherOffset = otherScene.commonState.offset;
            const otherEnd = otherScene.commonState.end;
            const otherMiddle = (otherEnd + otherOffset) / 2;
            const otherDiv = document.getElementById(otherScene.commonState.id);
            if (otherMiddle > middle) {
                otherDiv.style.transform = `translate3d(${uiStore.secToPx(
                    otherScene.commonState.offset + moveOffset
                )}px, ${0}px, ${0}px)`;
            } else {
                otherDiv.style.transform = `translate3d(${uiStore.secToPx(
                    otherScene.commonState.offset
                )}px, ${0}px, ${0}px)`;
            }
        }

		const positionIndicatorDiv = document.getElementById(uiStore.timelineConst.positionIndicatorId);
		const positionIndicatorLabelDiv = document.getElementById(uiStore.timelineConst.positionIndicatorLabelId);
		if (positionIndicatorDiv) {
			positionIndicatorDiv.style.transform = `translate3d(${uiStore.secToPx(
				newOffset
			)}px, ${0}px, ${0}px)`;
		}
		if (positionIndicatorLabelDiv) {
			positionIndicatorLabelDiv.innerHTML = playPositionToFormat(newOffset);
		}
    }

    return (
        <TimelineItem
            id={scene.commonState.id}
            ref={setNodeRef}
            scene={scene}
			scenes={scenes}
            transform={adjustedTransform}
            isOverlay={false}
			onClick={onTimelineItemClick}
            {...attributes}
            {...listeners}
        />
    );
});

export default DraggableTimelineItem;
