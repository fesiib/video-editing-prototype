import React, { useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import TimelinePositionIndicator from "./TimelinePositionIndicator";

import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat } from "../../utilities/timelineUtilities";
import PositionIndicator from "./PositionIndicator";

const TimelineLabels = observer(function TimelineLabels({}) {
	const labelsRef = useRef(null);

    const { uiStore } = useRootContext();

    const width = uiStore.trackWidthPx;
    const height = uiStore.timelineConst.labelHeight;
    const handlerWidth = uiStore.timelineConst.trackHandlerWidth;
    const labelIntervalPx = uiStore.timelineConst.labelIntervalPx;

    const labels = useMemo(() => {
        const newLabels = [];
        for (let px = 0; px < width; px += labelIntervalPx) {
            let timestamp = uiStore.pxToSec(px + labelIntervalPx);
            newLabels.push(timestamp);
        }
        return newLabels;
    }, [width, labelIntervalPx]);

    const onIndicatorDragEnd = action((event) => {
        const { delta } = event;
        const transformSeconds = uiStore.pxToSec(delta.x);
		if (uiStore.timelineControls.isPlaying) {
			uiStore.timelineControls.tryPlaying = false;
		}
        uiStore.timelineControls.playPosition = Math.min(
            uiStore.timelineConst.trackMaxDuration,
            Math.max(
                uiStore.timelineConst.trackMinDuration,
                uiStore.timelineControls.playPosition + transformSeconds
            )
        );
    });

	const [positionIndicatorVisibilty, setPositionIndicatorVisibility] = useState(false);
    const [playPosition, setPlayPosition] = useState(0);

    const showPositionIndicator = (event) => {
        setPositionIndicatorVisibility((visibility) => true);
    };

    const hidePositionIndicator = (event) => {
        setPositionIndicatorVisibility((visibility) => false);
    };

    const updatePositionIndicator = (event) => {
        const timelineRect = labelsRef.current.getBoundingClientRect();
        let playPositionPx =
            event.clientX -
            timelineRect.left +
            labelsRef.current.scrollLeft -
			handlerWidth;
        if (playPositionPx < 0) {
            playPositionPx = 0;
        }
        setPlayPosition(uiStore.pxToSec(playPositionPx));
    };

    const onLabelClick = action((event) => {
		if (uiStore.timelineControls.isPlaying) {
			uiStore.timelineControls.tryPlaying = false;
		}
        const timelineRect = labelsRef.current.getBoundingClientRect();
        let playPositionPx =
            event.clientX -
            timelineRect.left +
            labelsRef.current.scrollLeft -
			handlerWidth;
        if (playPositionPx < 0) {
            return;
        }
        uiStore.timelineControls.playPosition = uiStore.pxToSec(playPositionPx);
    });


    return (<div>
		<DndContext
			sensors={useSensors(useSensor(PointerSensor))}
			modifiers={[restrictToHorizontalAxis]}
			onDragEnd={onIndicatorDragEnd}
		>
			<TimelinePositionIndicator />
		</DndContext>
		<div
            className="flex flex-row flex-nowrap"
            style={{
                width: width + handlerWidth,
				height: height,
            }}

			ref={labelsRef}
			onMouseEnter={showPositionIndicator}
			onMouseLeave={hidePositionIndicator}
			onMouseMove={updatePositionIndicator}
        >
            <div
                //className="my-2"
                style={{
                    width: handlerWidth,
                    overflow: "hidden",
                }}
            >
                {" "}
                #
			</div>
			<div
				className={"bg-slate-500 flex relative"}
				style={{
					width: width,
					height: height,
				}}
				onClick={onLabelClick}
			>
				{labels.map((timestamp) => {
					return (
						<span
							key={"label" + timestamp}
							className={"text-xs text-right border-r-2"}
							style={{
								width: labelIntervalPx,
								height: uiStore.timelineConst.labelHeight,
							}}
						>
							{playPositionToFormat(timestamp)}
						</span>
					);
				})}
			</div>
			{positionIndicatorVisibilty ? (
                <div
                    className={"absolute top-0 z-30"}
                    style={{
                        height: uiStore.timelineSize.height,
                        left:handlerWidth -
                            uiStore.timelineConst.positionIndicatorWidth / 2,
                        transform: `translate3d(${uiStore.secToPx(playPosition)}px, 0px, 0px)`,
                    }}
				>
                    <PositionIndicator
                        showLabel={true}
                        playPosition={playPosition}
                        className="opacity-80 pointer-events-none"
                    />
                </div>
            ) : null}
        </div>
	</div>);
});

export default TimelineLabels;
