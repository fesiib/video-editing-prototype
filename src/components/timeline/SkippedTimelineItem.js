import React from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import {
    playPositionToFormat,
} from "../../utilities/timelineUtilities";

const SkippedTimelineItem = observer(function SkippedTimelineItem({ skippedScene, skippedScenes, scenes }) {
	const { uiStore, domainStore } = useRootContext();

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: skippedScene.commonState.id,
        data: {
            type: "scene",
            scene: skippedScene,
        },
        disabled: true,
    });

	const onTimelineItemClick = action((event) => {
        event.stopPropagation();
        event.preventDefault();

        if (uiStore.timelineControls.splitting || uiStore.timelineControls.rangeSelectingTimeline) {
            return;
        }
    });

    let adjustedTransform = {
        ...transform,
    };

    return (
        <TimelineItem
            id={skippedScene.commonState.id}
            ref={setNodeRef}
			itemType={"skipped"}
            scene={skippedScene}
            scenes={skippedScenes}
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

export default SkippedTimelineItem;
