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

        if (uiStore.timelineControls.splitting || uiStore.timelineControls.rangeSelectingTimeline) {
            return;
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
