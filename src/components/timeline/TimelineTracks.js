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

    const onGenericDragEnd = action((event) => {
        const { active, delta, over } = event;
        const type = active.data.current.type;
        console.log("end", type, event);

        if (type === "track") {
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
            const scene = active.data.current.scene;
            scene.commonState.offset += uiStore.pxToSec(delta.x);
            if (over) {
                const oldTrackId = scene.commonState.trackInfo.trackId;
                const newTrackId = over.data.current.trackId;
                if (newTrackId !== oldTrackId) {
                    scene.commonState.trackInfo.trackId = newTrackId;
                    setTracks((tracks) => {
                        const oldIndex = tracks.findIndex((value) => value.trackId === oldTrackId);
                        const newIndex = tracks.findIndex((value) => value.trackId === newTrackId);
                        const sceneIndex = tracks[oldIndex].scenes.findIndex(
                            (curScene) => curScene.commonState.id === scene.commonState.id
                        );
                        tracks[oldIndex].scenes.splice(sceneIndex, 1);
                        tracks[newIndex].scenes.push(scene);
                        return tracks;
                    });
                }
            }
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
    }, [domainStore.videos, trackCnt]);

    return (
        <div
            className="bg-slate-300 m-5 flex-column overflow-scroll"
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
                onDragEnd={onGenericDragEnd}
            >
                <SortableContext
                    items={tracks.map(({ trackId }) => "sortable_track_" + trackId)}
                    strategy={verticalListSortingStrategy}
                >
                    {tracks.map(({ trackId, scenes }) => {
                        const id = "track_" + trackId;
                        return (
                            <SortableTimelineTrack
                                key={id}
                                trackId={trackId}
                                title={id}
                                scenes={scenes}
                            />
                        );
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
                            title={"overlay"}
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
