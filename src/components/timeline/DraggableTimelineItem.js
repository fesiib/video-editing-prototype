import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import { preventCollisionDrag } from "../../utilities/timelineUtilities";

const DraggableTimelineItem = observer(function DraggableTimelineItem({ scene, scenes }) {
    const { uiStore } = useRootContext();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: scene.commonState.id,
        data: {
            type: "scene",
            scene,
        },
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
    }

    return (
        <TimelineItem
            id={scene.commonState.id}
            ref={setNodeRef}
            scene={scene}
			scenes={scenes}
            transform={adjustedTransform}
            isOverlay={false}
            {...attributes}
            {...listeners}
        />
    );
});

export default DraggableTimelineItem;
