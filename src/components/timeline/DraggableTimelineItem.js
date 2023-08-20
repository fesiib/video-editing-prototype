import React from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import {
    playPositionToFormat,
    preventCollisionDragMultiple,
} from "../../utilities/timelineUtilities";

const DraggableTimelineItem = observer(function DraggableTimelineItem({ scene, scenes }) {
    const { uiStore } = useRootContext();

    const isSelected =
        uiStore.timelineControls.selectedTimelineItems.findIndex(
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

        if (uiStore.timelineControls.splitting) {
            const labelsDiv = document.getElementById(uiStore.timelineConst.timelineLabelsId);
            const timelineRect = labelsDiv.getBoundingClientRect();
            let offsetPx =
                event.clientX -
                timelineRect.left +
                labelsDiv.scrollLeft -
                uiStore.timelineConst.trackHandlerWidth;
			uiStore.resetTempState();
            const {left, right} = scene.split(uiStore.pxToSec(offsetPx));
			scene.replaceSelf([left, right]);
            uiStore.timelineControls.splitting = false;
            uiStore.timelineControls.positionIndicatorVisibility -= 1;
            return;
        }

		if (uiStore.timelineControls.rangeSelectingTimeline) {
			return;
		}

        const index = uiStore.timelineControls.selectedTimelineItems.findIndex(
            (value) => value.commonState.id === scene.commonState.id
        );
        const areItemsSelected = uiStore.timelineControls.selectedTimelineItems.length > 0;
        const sameTrack = areItemsSelected
            ? scene.commonState.trackId ===
              uiStore.timelineControls.selectedTimelineItems[0].commonState.trackId
            : true;
        const metaKey = event.metaKey;
        if (metaKey && areItemsSelected && sameTrack) {
            let newSelectedTimelineItems = [];
            if (index >= 0) {
                const rightMostEnd = scene.commonState.end;
                for (let otherScene of uiStore.timelineControls.selectedTimelineItems) {
                    if (otherScene.commonState.end < rightMostEnd) {
                        newSelectedTimelineItems.push(otherScene);
                    }
                }
            } else {
                let leftMostOffset = scene.commonState.offset;
                let rightMostEnd = scene.commonState.end;
                for (let otherScene of uiStore.timelineControls.selectedTimelineItems) {
                    leftMostOffset = Math.min(leftMostOffset, otherScene.commonState.offset);
                    rightMostEnd = Math.max(rightMostEnd, otherScene.commonState.end);
                }
                for (let someScene of scenes) {
                    if (
                        someScene.commonState.offset >= leftMostOffset &&
                        someScene.commonState.end <= rightMostEnd
                    ) {
                        newSelectedTimelineItems.push(someScene);
                    }
                }
            }
            uiStore.selectTimelineObjects([...newSelectedTimelineItems]);
        } else {
            if (index >= 0) {
                uiStore.selectTimelineObjects([]);
            } else {
                uiStore.selectTimelineObjects([scene]);
            }
        }
    });

    const onTimelineItemMouseEnter = action((event) => {
        if (uiStore.timelineControls.splitting) {
            uiStore.timelineControls.positionIndicatorVisibility += 1;
        }
    });

    const onTimelineItemMouseLeave = action((event) => {
        if (uiStore.timelineControls.splitting) {
            uiStore.timelineControls.positionIndicatorVisibility -= 1;
        }
    });

    const onTimelineItemMouseMove = (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (uiStore.timelineControls.splitting) {
            const labelsDiv = document.getElementById(uiStore.timelineConst.timelineLabelsId);
            const timelineRect = labelsDiv.getBoundingClientRect();

            const positionIndicatorDiv = document.getElementById(
                uiStore.timelineConst.positionIndicatorId
            );
            const positionIndicatorLabelDiv = document.getElementById(
                uiStore.timelineConst.positionIndicatorLabelId
            );
            const videoElement = document.getElementById("video_element_" + scene.commonState.id);

            let offsetPx =
                event.clientX -
                timelineRect.left +
                labelsDiv.scrollLeft -
                uiStore.timelineConst.trackHandlerWidth;

            const offset = uiStore.pxToSec(offsetPx);

            if (positionIndicatorDiv) {
                positionIndicatorDiv.style.transform = `translate3d(${offsetPx}px, ${0}px, ${0}px)`;
            }
            if (positionIndicatorLabelDiv) {
                positionIndicatorLabelDiv.innerHTML = playPositionToFormat(offset);
            }
            if (videoElement) {
                videoElement.currentTime =
                    offset - scene.commonState.offset + scene.commonState.start;
            }
        } else {
            return;
        }
    };

    let adjustedTransform = {
        ...transform,
    };

    if (isSelected && isDragging && typeof adjustedTransform?.x === "number") {
        const selectedScenes = uiStore.timelineControls.selectedTimelineItems;
        const { leftMostScene, newOffset, moveOffset, middle } = preventCollisionDragMultiple(
            scene,
            scenes,
            transform,
            uiStore
        );
        adjustedTransform = {
            ...transform,
            x: uiStore.secToPx(newOffset - leftMostScene.commonState.offset),
        };
        // move items on the right side
        for (let otherScene of scenes) {
            const isSelected =
                selectedScenes.findIndex(
                    (value) => value.commonState.id === otherScene.commonState.id
                ) >= 0;
            const otherDiv = document.getElementById(otherScene.commonState.id);
            if (isSelected) {
                if (otherScene.commonState.id !== scene.commonState.id) {
                    otherDiv.style.transform = `translate3d(${uiStore.secToPx(
                        otherScene.commonState.offset +
                            (newOffset - leftMostScene.commonState.offset)
                    )}px, ${0}px, ${0}px)`;
                }
                continue;
            }
            const otherOffset = otherScene.commonState.offset;
            const otherEnd = otherScene.commonState.end;
            const otherMiddle = (otherEnd + otherOffset) / 2;
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

        const positionIndicatorDiv = document.getElementById(
            uiStore.timelineConst.positionIndicatorId
        );
        const positionIndicatorLabelDiv = document.getElementById(
            uiStore.timelineConst.positionIndicatorLabelId
        );
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
			isMain={false}
            scene={scene}
            scenes={scenes}
            transform={adjustedTransform}
            isOverlay={false}
            onClick={onTimelineItemClick}
            onMouseMove={onTimelineItemMouseMove}
            onMouseEnter={onTimelineItemMouseEnter}
            onMouseLeave={onTimelineItemMouseLeave}
			//onDrag={onDrag}
            attributes={attributes}
            listeners={listeners}
        />
    );
});

export default DraggableTimelineItem;
