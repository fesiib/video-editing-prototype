import React from "react";

import { observer } from "mobx-react-lite";

import { useDraggable } from "@dnd-kit/core";

import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat } from "../../utilities/timelineUtilities";
import PositionIndicator from "./PositionIndicator";

const TimelinePositionIndicator = observer(function TimelinePositionIndicator({}) {
    const { uiStore } = useRootContext();

    const height = uiStore.timelineSize.height;
    const positionIndicatorWidth = uiStore.timelineConst.positionIndicatorWidth;

    const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
        id: "position_indicator",
    });
	const transformSeconds = (typeof transform?.x === 'number' ? uiStore.pxToSec(transform.x) : 0);
    const playPosition = Math.min(uiStore.timelineConst.trackMaxDuration,
		Math.max(uiStore.timelineConst.trackMinDuration,
			uiStore.timelineControls.playPosition + transformSeconds)
	);
	const playPositionPx = uiStore.secToPx(playPosition);
    return (
        <>
            <div
                className={
                    isDragging ? "absolute z-20 bg-violet-500" : "absolute z-20 hover:bg-violet-500"
                }
                style={{
                    height: height,
                    left: -positionIndicatorWidth / 2,
					transform: `translate3d(${playPositionPx}px, 0px, 0px)`
                }}
                ref={setNodeRef}
                {...listeners}
                {...attributes}
            >
				<PositionIndicator
					showLabel={isDragging}
					playPosition={playPosition}
				/>
            </div>
        </>
    );
});

export default TimelinePositionIndicator;
