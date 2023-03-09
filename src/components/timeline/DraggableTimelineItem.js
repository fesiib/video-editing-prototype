import React from "react";

import { observer } from "mobx-react-lite";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

const DraggableTimelineItem = observer(function DraggableTimelineItem({ scene }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: scene.id,
        data: {
            type: "scene",
            scene,
        },
    });

    return (
        <TimelineItem
            ref={setNodeRef}
            scene={scene}
            transform={null}
            isOverlay={false}
            {...attributes}
            {...listeners}
        />
    );
});

export default DraggableTimelineItem;
