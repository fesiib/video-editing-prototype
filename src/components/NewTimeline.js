import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToParentElement, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { createRef, forwardRef, useEffect, useState } from "react";
import useRootContext from "../hooks/useRootContext";
import TimelineItemWrapper from "./TimelineItem";

const TimelinePositionIndicator = observer(function TimelinePositionIndicator({ id
}) {

	const {
		attributes,
		listeners,
		setNodeRef,
		transform
	} = useDraggable({
		id: id
	});

	const style = {
		transform: CSS.Transform.toString(transform),
	};

	return (<div className="flex-start"
		style={style}
		ref={setNodeRef}
		{...listeners}
		{...attributes}
	>
		indicator
	</div>)
});

const TimelineLabels = observer(function TimelineLabels({

}) {
	const {
		uiStore,
		domainStore
	} = useRootContext();

	const width = uiStore.timelineConst.timelineMaxWidth;
	const height = uiStore.timelineConst.labelHeight;

	return (<DndContext
		modifiers={[
			restrictToHorizontalAxis,
			restrictToParentElement
		]}
	>
		<div 
			className="bg-slate-500 flex"
			style={{
				width: width,
				height: height,
			}}
		>
			<TimelinePositionIndicator id={"draggable_indicator"}/>
		</div>
	</DndContext>);
});


const TimelineTrack = observer(function TimelineTrack({
	id, isOverlay, title, scenes
}){
	const {
		uiStore,
		domainStore
	} = useRootContext();

	const width = uiStore.timelineConst.timelineMaxWidth;

	const {
		setNodeRef
	} = useDroppable({
		id: "droppable" + id,
	});

	const onSceneDragEnd = action((event) => {
		const {
			active,
			delta
		} = event;
		console.log(event);
		const scene = active.data.current.scene;
		scene.x += delta.x;
		scene.y += delta.y;
	});

	return (<DndContext
		modifiers={[]}
		onDragEnd={onSceneDragEnd}
	>
		<div
			className="bg-slate-600 my-1 relative h-10"
			style={{
				width: width,
			}}
			ref={setNodeRef}
		>
			<div className="absolute inset-y-0 left-0">
				{title}
			</div>
			{
				scenes.map((scene) => (
					<TimelineItemWrapper
						key={scene.id}
						scene={scene}
					/>
				))
			}
		</div>
	</DndContext>);
});

const TimelineTracks = observer(function TimelineTracks({
}) {
	const {
		uiStore,
		domainStore
	} = useRootContext();

	const width = uiStore.timelineSize.width;
	const trackCnt = domainStore.projectMetadata.trackCnt;

	const [tracks, setTracks] = useState([]);
	const [activeItemId, setActiveItemId] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const onTimelineItemDragStart = (event) => {
	}

	const onTimelineItemDragEnd = action((event) => {
	});

	useEffect(() => {
		let newTracks = [];
		for (let i = 0; i < trackCnt; i++) {
			newTracks.push([]);
		}
		for (let video of domainStore.videos) {
			const id = video.trackInfo.trackId;
			newTracks[id].push(video);
		}
		setTracks(newTracks);
	}, [domainStore.videos, trackCnt]);
		
	return (<div className="bg-slate-400 m-5 flex-column overflow-scroll"
		style={{
			width: width
		}}
	>
		<TimelineLabels/>
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={onTimelineItemDragStart}
			onDragEnd={onTimelineItemDragEnd}
		>
			{
				tracks.map(( (scenes, id) => (
					<TimelineTrack
						key={"track" + id}
						id={id}
						title={"track" + id}
						scenes={scenes}
						isOverlay={false}
					/>
				)))
			}
			<DragOverlay
				className="bg-slate-500"
				modifiers={[
					restrictToHorizontalAxis,
					restrictToFirstScrollableAncestor
				]}
			>
				{
					activeItemId ? 
					<TimelineTrack
						key={"track_overlay"}
						id={activeItemId}
						title={""}
						scenes={[]}
						isOverlay={true}
					/>
					:
					null
				}
			</DragOverlay>
		</DndContext>
	</div>);
});

const NewTimeline = observer(function NewTimeline() {
	
	return (<div className="bg-slate-200">
		<TimelineTracks />
	</div>);
});

export default NewTimeline;