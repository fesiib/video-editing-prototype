import React, { useEffect, useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import {
    closestCorners,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableTimelineTrack from "./SortableTimelineTrack";
import TimelineTrack from "./TimelineTrack";
import TimelineLabels from "./TimelineLabels";
import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import { preventCollisionDragMultiple } from "../../utilities/timelineUtilities";

const TimelineTracks = observer(function TimelineTracks() {
    const { uiStore, domainStore } = useRootContext();

    const width = uiStore.timelineSize.width;
    const trackCnt = domainStore.projectMetadata.trackCnt;

	const tracksContainer = useRef(null);

    const [tracks, setTracks] = useState([]);
    const [activeTrackId, setActiveTrackId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

	const videos = domainStore.videos;
	const skippedParts = domainStore.skippedParts;
	const edits = domainStore.curIntent.activeEdits;

    const onGenericDragStart = action((event) => {
        const { active } = event;
        const { type, scene } = active.data.current;
        console.log("start", type, event);

        if (type === "track") {
            setActiveTrackId(active.id);
        } else if (type === "scene") {
            setActiveItem(active);
            uiStore.timelineControls.positionIndicatorVisibility += 1;
            uiStore.timelineControls.positionIndicatorSec = scene.commonState.offset;
        }
    });

    const sceneTrackChange = action((active, over, delta) => {
        const scene = active.data.current.scene;
        const selectedScenes = uiStore.timelineControls.selectedTimelineItems;
        if (over) {
            const oldTrackId = scene.commonState.trackId;
            const newTrackId = over.data.current.trackId;
            if (newTrackId !== oldTrackId) {
                setTracks(
                    action((tracks) => {
                        for (let selectedScene of selectedScenes) {
                            selectedScene.commonState.trackId = newTrackId;
                        }
                        const newTracks = tracks.map((track) => {
                            let newScenes = [];
                            if (track.trackId === oldTrackId) {
                                for (let otherScene of track.scenes) {
                                    const isSelected =
                                        selectedScenes.findIndex(
                                            (value) =>
                                                value.commonState.id === otherScene.commonState.id
                                        ) >= 0;
                                    if (!isSelected) {
                                        newScenes.push(otherScene);
                                    }
                                }
                                for (let otherScene of newScenes) {
                                    const otherDiv = document.getElementById(
                                        otherScene.commonState.id
                                    );
                                    otherDiv.style.transform = `translate3d(${uiStore.secToPx(
                                        otherScene.commonState.offset
                                    )}px, ${0}px, ${0}px)`;
                                }
                                return {
                                    trackId: track.trackId,
                                    scenes: newScenes,
                                };
                            }
                            if (track.trackId === newTrackId) {
                                const newScenes = [...track.scenes, ...selectedScenes];
                                return {
                                    trackId: track.trackId,
                                    scenes: newScenes,
                                };
                            }
                            return track;
                        });
                        return newTracks;
                    })
                );
            }
        }
        if (delta) {
            const index = tracks.findIndex(
                (value) => value.trackId === scene.commonState.trackId
            );
            const selectedScenes = uiStore.timelineControls.selectedTimelineItems;
            const { leftMostScene, newOffset, moveOffset, middle } = preventCollisionDragMultiple(
                scene,
                tracks[index].scenes,
                delta,
                uiStore
            );
            for (let otherScene of tracks[index].scenes) {
                const isSelected =
                    selectedScenes.findIndex(
                        (value) => value.commonState.id === otherScene.commonState.id
                    ) >= 0;
                if (isSelected) {
                    continue;
                }
                const otherOffset = otherScene.commonState.offset;
                const otherEnd = otherScene.commonState.end;
                const otherMiddle = (otherEnd + otherOffset) / 2;

                if (otherMiddle > middle) {
                    otherScene.commonState.offset = otherScene.commonState.offset + moveOffset;
                }
            }
            const deltaSeconds = newOffset - leftMostScene.commonState.offset;
            for (let selectedScene of selectedScenes) {
                selectedScene.commonState.offset = selectedScene.commonState.offset + deltaSeconds;
            }
        }
    });

    const onGenericDrageMove = action((event) => {
        const { active, over } = event;
        const type = active.data.current.type;
        console.log("move", type, event);
        if (type === "scene") {
            sceneTrackChange(active, over, null);
        }
    });

    const onGenericDragEnd = action((event) => {
        const { active, delta, over } = event;
        const type = active.data.current.type;
        console.log("end", type, event);
        if (type === "track" && over) {
            if (active.id !== over.id) {
                const activeTrackId = active.data.current.trackId;
                const overTrackId = over.data.current.trackId;
                setTracks((tracks) => {
                    const oldIndex = tracks.findIndex((value) => value.trackId === activeTrackId);
                    const newIndex = tracks.findIndex((value) => value.trackId === overTrackId);
                    return arrayMove(tracks, oldIndex, newIndex);
                });
            }
            setActiveTrackId(null);
        } else if (type === "scene") {
            sceneTrackChange(active, over, delta);
            setActiveItem(null);
            uiStore.timelineControls.positionIndicatorVisibility -= 1;
        }
    });

	const onBackgroundClick = action((event) => {
        uiStore.selectTimelineObjects([]);
    });

    useEffect(() => {
        let newTracks = [];
        for (let i = 0; i < trackCnt; i++) {
            newTracks.push({
                trackId: i,
				mainScenes: [],
				skippedScenes: [],
                scenes: [],
            });
        }
		for (let video of videos) {
			const id = video.commonState.trackId;
            newTracks[id].mainScenes.push(video);
		}
		for (let skipped of skippedParts) {
			const id = skipped.commonState.trackId;
			newTracks[id].skippedScenes.push(skipped);
		}
        for (let edit of edits) {
            const id = edit.commonState.trackId;
            newTracks[id].scenes.push(edit);
        }
        setTracks(newTracks);
    }, [videos.length, skippedParts.length, edits.length, trackCnt]);

	useEffect(() => {
		if (tracksContainer.current) {
			const playPositionPx = uiStore.secToPx(uiStore.timelineControls.playPosition);
			if (tracksContainer.current.scrollLeft > playPositionPx) {
				tracksContainer.current.scrollLeft = Math.max(0, playPositionPx - 100);
			}
			if (playPositionPx - tracksContainer.current.scrollLeft > width) {
				tracksContainer.current.scrollLeft = playPositionPx - width + 100;
			}
		}
	}, [uiStore.timelineControls.playPosition])

    return (
        <div
			ref={tracksContainer}
            className="bg-slate-300 m-5 flex-column overflow-scroll relative disable-select"
			style={{
                width: width,
            }}
        >
            <TimelineLabels />
			<div
				onClick={onBackgroundClick}
			>
				<DndContext
					sensors={useSensors(
						useSensor(PointerSensor, {
							activationConstraint: {
								distance: 10,
							},
						})
					)}
					modifiers={[restrictToFirstScrollableAncestor]}
					collisionDetection={closestCorners}
					onDragStart={onGenericDragStart}
					onDragOver={onGenericDrageMove}
					onDragEnd={onGenericDragEnd}
				>
					<SortableContext
						items={tracks.map(({ trackId }) => "sortable_track_" + trackId)}
						strategy={verticalListSortingStrategy}
					>
						{tracks.map(({ trackId, mainScenes, skippedScenes, scenes }) => {
							const id = "track_" + trackId;
							return <SortableTimelineTrack 
								key={id}
								trackId={trackId}
								mainScenes={mainScenes}
								skippedScenes={skippedScenes}
								scenes={scenes}
							/>;
						})}
					</SortableContext>
					<DragOverlay
						modifiers={!!activeTrackId ? [restrictToVerticalAxis] : []}
						dropAnimation={null}
					>
						{activeTrackId ? (
							<TimelineTrack
								key={"track_overlay"}
								id={activeTrackId}
								title={"?"}
								mainScenes={[]}
								skippedScenes={[]}
								scenes={[]}
								isOverlay={true}
								isOver={false}
							/>
						) : null}
						{activeItem ? (
							<TimelineItem
								key={"item_overlay"}
								scene={activeItem.data.current.scene}
								scenes={[]}
								transform={null}
								itemType={"overlay"}
								id={activeItem.id}
							/>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>
        </div>
    );
});

export default TimelineTracks;
