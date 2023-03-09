import React from "react";

import { observer } from "mobx-react-lite";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import TimelineTrack from "./TimelineTrack";

const SortableTimelineTrack = observer(function SortableTimelineTrack({ trackId, title, scenes }) {
    const id = "track_" + trackId;

    const { attributes, listeners, setNodeRef, transform, transition, isOver, active } =
        useSortable({
            id: "sortable_" + id,
            data: {
                type: "track",
                trackId,
            },
            transition: {
                duration: 150, // milliseconds
                easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            },
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isSceneOver = isOver && active.data.current.type === "scene";

    return (
        <TimelineTrack
            ref={setNodeRef}
            style={style}
            id={id}
            title={title}
            scenes={scenes}
            isOverlay={false}
            isOver={isSceneOver}
            {...attributes}
            {...listeners}
        />
    );
});

export default SortableTimelineTrack;
