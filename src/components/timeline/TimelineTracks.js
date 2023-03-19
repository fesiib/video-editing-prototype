import React, { useEffect, useState } from "react";

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
import { preventCollision } from "../../utilities/timelineUtilities";

const TimelineTracks = observer(function TimelineTracks() {
    const { uiStore, domainStore } = useRootContext();

    const width = uiStore.timelineSize.width;
    const trackCnt = domainStore.projectMetadata.trackCnt;

    const [tracks, setTracks] = useState([]);
    const [activeTrackId, setActiveTrackId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const onGenericDragStart = action((event) => {
        const { active } = event;
        const type = active.data.current.type;
        console.log("start", type, event);

        if (type === "track") {
            setActiveTrackId(active.id);
        } else if (type === "scene") {
            setActiveItem(active);
        }
    });

    const sceneTrackChange = action((active, over, delta) => {
        const scene = active.data.current.scene;
        if (over) {
            const oldTrackId = scene.commonState.trackInfo.trackId;
            const newTrackId = over.data.current.trackId;
            if (newTrackId !== oldTrackId) {
                setTracks(
                    action((tracks) => {
                        scene.commonState.trackInfo.trackId = newTrackId;
                        const newTracks = tracks.map((track) => {
                            if (track.trackId === oldTrackId) {
                                const sceneIndex = track.scenes.findIndex(
                                    (curScene) => curScene.commonState.id === scene.commonState.id
                                );
                                const newScenes = [
                                    ...track.scenes.slice(0, sceneIndex),
                                    ...track.scenes.slice(sceneIndex + 1),
                                ];
								for (let otherScene of newScenes) {
									const otherDiv = document.getElementById(otherScene.commonState.id);
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
                                const newScenes = [...track.scenes, scene];
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
                (value) => value.trackId === scene.commonState.trackInfo.trackId
            );
            const { newOffset, moveOffset, middle } = preventCollision(
                scene,
                tracks[index].scenes,
                delta,
                uiStore
            );
            for (let otherScene of tracks[index].scenes) {
                if (otherScene.commonState.id === scene.commonState.id) {
                    continue;
                }
                const otherOffset = otherScene.commonState.offset;
                const otherEnd = otherScene.commonState.end;
                const otherMiddle = (otherEnd + otherOffset) / 2;

                if (otherMiddle > middle) {
                    otherScene.commonState.offset = otherScene.commonState.offset + moveOffset;
                }
            }
            scene.commonState.offset = newOffset;
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
        }
    });

    useEffect(() => {
        let newTracks = [];
        for (let i = 0; i < trackCnt; i++) {
            newTracks.push({
                trackId: i,
                scenes: [],
            });
        }
        for (let video of domainStore.videos) {
            const id = video.commonState.trackInfo.trackId;
            newTracks[id].scenes.push(video);
        }
        for (let text of domainStore.texts) {
            const id = text.commonState.trackInfo.trackId;
            newTracks[id].scenes.push(text);
        }
        setTracks(newTracks);
    }, [domainStore.videos, domainStore.texts, trackCnt]);
    return (
        <div
            className="bg-slate-300 m-5 flex-column overflow-scroll relative"
            style={{
                width: width,
            }}
        >
            <TimelineLabels />
            <DndContext
                sensors={useSensors(useSensor(PointerSensor))}
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
                    {tracks.map(({ trackId, scenes }) => {
                        const id = "track_" + trackId;
                        return <SortableTimelineTrack key={id} trackId={trackId} scenes={scenes} />;
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
                            scenes={[]}
                            isOverlay={true}
                            isOver={false}
                        />
                    ) : null}
                    {activeItem ? (
                        <TimelineItem
                            key={"item_overlay"}
                            scene={activeItem.data.current.scene}
                            transform={null}
                            isOverlay={true}
                            id={activeItem.id}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
});

export default TimelineTracks;
