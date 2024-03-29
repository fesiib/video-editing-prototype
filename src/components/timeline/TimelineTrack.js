import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import DraggableTimelineItem from "./DraggableTimelineItem";

import useRootContext from "../../hooks/useRootContext";
import EmptySpace from "./EmptySpace";
import MainTimelineItem from "./MainTimelineItem";
import StaticTimelineItem from "./StaticTimelineItem";

import { BiMoviePlay, BiSolidMoviePlay } from "react-icons/bi";
import { AiFillBulb, AiOutlineBulb } from "react-icons/ai";

const TimelineTrack = observer(
    forwardRef(function TimelineTrack(
        { id, style, title, mainScenes, skippedScenes, scenes, staticScenes, isOverlay, isOver, setActivatorNodeRef, listeners, attributes },
        ref
    ) {
        const { uiStore, domainStore } = useRootContext();
        const width = uiStore.trackWidthPx;
        const handlerWidth = uiStore.timelineConst.trackHandlerWidth;
		mainScenes.sort((p1, p2) => p1.commonState.offset - p2.commonState.offset);
		skippedScenes.sort((p1, p2) => p1.commonState.offset - p2.commonState.offset);
		scenes.sort((p1, p2) => p1.commonState.offset - p2.commonState.offset);
		// const emptySpaces = scenes.map((value, idx) => {
		// 	const lastEnd = idx === 0 ? 0 : scenes[idx - 1].commonState.end;
		// 	let space = {
		// 		offset: lastEnd,
		// 		duration: value.commonState.offset - lastEnd,
		// 		idx: idx,
		// 		key: "empty_space_for_" + value.commonState.id,
		// 	};
		// 	return space;
		// });

        return (
            <div
                ref={ref}
                id={id}
                className="flex flex-row flex-nowrap"
                style={{
                    ...style,
                    width: handlerWidth + width,
                    overflow: "visible",
                }}
            >
                <div
                    ref={setActivatorNodeRef}
                    className="my-2"
                    style={{
                        width: handlerWidth,
                        overflow: "hidden",
                    }}
                    {...listeners}
                    {...attributes}
                >
                    {" "}
                    {title}
                </div>
                <div
                    className={
                        (isOverlay
                            ? "bg-slate-600"
                            : isOver
                            ? "bg-slate-500"
                            : "bg-slate-400")
						+ " my-1 relative h-14"
                    }
                    style={{
                        width: width,
                    }}
                >

					{mainScenes.map((mainScene) => (
                        <MainTimelineItem
                            key={mainScene.commonState.id}
                            mainScene={mainScene}
                            mainScenes={mainScenes}
							scenes={scenes}
                        />
                    ))}
					{skippedScenes.map((skippedScene) => (
                        <StaticTimelineItem
                            key={skippedScene.commonState.id}
                            staticScene={skippedScene}
                            staticScenes={skippedScenes}
							scenes={scenes}
							itemType={"skipped"}
                        />
                    ))}
                    {scenes.map((scene) => (
                        <DraggableTimelineItem
                            key={scene.commonState.id}
                            scene={scene}
                            scenes={scenes}
                        />
                    ))}
					{staticScenes.map((staticScene) => (
						<StaticTimelineItem
							key={staticScene.commonState.id}
							staticScene={staticScene}
							staticScenes={staticScenes}
							scenes={scenes}
							itemType={"suggested"}
						/>
					))}
					{/* {emptySpaces.map((space) => (
						<EmptySpace
							key={space.key}
							space={space}
							scenes={scenes} />
					))} */}
					<div className="absolute top-2.5 z-20 w-fit"
						id={`video_indicator_${id}`}
						style={{
							marginLeft: "0.5em",
							pointerEvents: "none",
						}}
					>
						<BiMoviePlay />
					</div>
					<div className="absolute bottom-2 z-20 w-fit"
						id={`sugg_indicator_${id}`}
						style={{
							marginLeft: "0.5em",
							pointerEvents: "none",
						}}
					>
						<AiOutlineBulb />
					</div>
                </div>
            </div>
        );
    })
);

export default TimelineTrack;
