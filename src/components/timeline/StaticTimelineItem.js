import React from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import {
    playPositionToFormat,
} from "../../utilities/timelineUtilities";

const StaticTimelineItem = observer(function StaticTimelineItem({
		staticScene, staticScenes, scenes, itemType 
}) {
	const { uiStore, domainStore } = useRootContext();

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: staticScene.commonState.id,
        data: {
            type: "scene",
            scene: staticScene,
        },
        disabled: true,
    });

	const onTimelineItemClick = action((event) => {
        event.stopPropagation();
        event.preventDefault();
        if (uiStore.timelineControls.splitting) {
            return;
        }
		if (itemType === "skipped") {
			return;	
		}
		if (itemType === "suggested") {
			if (uiStore.timelineControls.rangeSelectingTimeline) {
				uiStore.timelineControls.rangeSelectingTimeline = false;
				uiStore.timelineControls.rangeSelectingFirstPx = -1;
				uiStore.timelineControls.positionIndicatorVisibility -= 1;
			}
	
			const index = uiStore.timelineControls.selectedTimelineItems.findIndex(
				(value) => value.commonState.id === staticScene.commonState.id
			);
			const areItemsSelected = uiStore.timelineControls.selectedTimelineItems.length > 0;
			const areItemsSuggested = areItemsSelected ? uiStore.timelineControls.selectedTimelineItems[0].isSuggested : false;
			const sameTrack = areItemsSelected
				? staticScene.commonState.trackId ===
				  uiStore.timelineControls.selectedTimelineItems[0].commonState.trackId
				: true;
			const metaKey = event.metaKey;
			if (metaKey && areItemsSelected && sameTrack && areItemsSuggested) {
				let newSelectedTimelineItems = [];
				if (index >= 0) {
					const rightMostEnd = staticScene.commonState.end;
					for (let otherScene of uiStore.timelineControls.selectedTimelineItems) {
						if (otherScene.commonState.end < rightMostEnd) {
							newSelectedTimelineItems.push(otherScene);
						}
					}
				} else {
					let leftMostOffset = staticScene.commonState.offset;
					let rightMostEnd = staticScene.commonState.end;
					for (let otherScene of uiStore.timelineControls.selectedTimelineItems) {
						leftMostOffset = Math.min(leftMostOffset, otherScene.commonState.offset);
						rightMostEnd = Math.max(rightMostEnd, otherScene.commonState.end);
					}
					for (let someScene of staticScenes) {
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
					uiStore.timelineControls.playPosition = staticScene.commonState.offset;
					uiStore.selectTimelineObjects([staticScene]);
				}
			}
		}
    });

    let adjustedTransform = {
        ...transform,
    };

    return (
        <TimelineItem
            id={staticScene.commonState.id}
            ref={setNodeRef}
			itemType={itemType}
            scene={staticScene}
            scenes={staticScenes}
            transform={adjustedTransform}
            onClick={onTimelineItemClick}
            onMouseMove={null}
            onMouseEnter={null}
            onMouseLeave={null}
            attributes={attributes}
            listeners={listeners}
        />
    );
});

export default StaticTimelineItem;
