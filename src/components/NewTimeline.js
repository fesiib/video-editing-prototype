import { closestCenter, closestCorners, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { createSnapModifier, restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { forwardRef, useEffect, useState } from "react";
import useRootContext from "../hooks/useRootContext";
import DraggableTimelineItem, { TimelineItem } from "./TimelineItem";

const TimelinePositionIndicator = observer(function TimelinePositionIndicator({
	id
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

const TimelineLabels = observer(function TimelineLabels() {
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


const TimelineTrack = observer(forwardRef(function TimelineTrack({
	style, id, title, scenes, isOverlay, ...props
}, ref) {
	const {
		uiStore,
		domainStore
	} = useRootContext();
	const width = uiStore.timelineConst.timelineMaxWidth;

	const [activeItem, setActiveItem] = useState(null);

	const {
		setNodeRef,
		isOver,
	} = useDroppable({
		id: "droppable" + toString(id),
		disabled: false,
	});

	const onSceneDragStart = action((event) => {
		const { active } = event;
		setActiveItem(active);
		console.log(active);
	});

	const onSceneDragOver = action((event) => {
		console.log("here")
		console.log(event);
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

	const snapToGridModifier = createSnapModifier(20);

	if (isOverlay) {
		console.log("HERE")
	}

	return (<div
		{...props}
		ref={ref}
	>
		<DndContext
			modifiers={[
				restrictToParentElement
			]}
			collisionDetection={closestCorners}
			onDragStart={onSceneDragStart}
			onDragOver={onSceneDragOver}
			onDragEnd={onSceneDragEnd}
		>
			<div
				className={ isOverlay ?
					"bg-slate-600 my-1 relative h-10" :
					(
						isOver ?
						"bg-slate-500 my-1 relative h-10" :
						"bg-slate-400 my-1 relative h-10"
					)
				}
				style={{
					width: width,
				}}
				ref={setNodeRef}
				aria-label={"Droppable region"}
			>
				<div className="absolute inset-y-0 left-0">
					{title}
				</div>
				{
					scenes.map((scene) => (
						<DraggableTimelineItem
							key={scene.id}
							scene={scene}
						/>
					))
				}
			</div>
			<DragOverlay
				modifiers={[ 
					snapToGridModifier,
				]}
				dropAnimation={null}
			>
			{
				activeItem ? 
				<TimelineItem
					key={"item_overlay"}
					scene={activeItem.data.current.scene}
					transform={null}
					isOverlay={true}
					id={activeItem.id}
				/>
				:
				null
			}
			</DragOverlay>
		</DndContext>
	</div>);
}));

const DraggableTimelineTrack = observer(function DraggableTimelineTrack({
	trackId, title, scenes
}) {
	const id = "track" + trackId;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		id: id,
		data: {
			trackId,
		}
	});

	const style = {
		trasnform: CSS.Transform.toString(transform),
		transition,
	};
	return (<TimelineTrack
		ref={setNodeRef}
		style={style}
		
		id={id}
		title={title}
		scenes={scenes}
		isOverlay={false}

		{...attributes}
		{...listeners}
	/>);
});

const TimelineTracks = observer(function TimelineTracks() {
	const {
		uiStore,
		domainStore
	} = useRootContext();

	const width = uiStore.timelineSize.width;
	const trackCnt = domainStore.projectMetadata.trackCnt;

	const [tracks, setTracks] = useState([]);
	const [activeTrackId, setActiveTrackId] = useState(null);

	const onTimelineTrackDragStart = (event) => {
		const { active } = event;
		setActiveTrackId(active.id);
	}

	const onTimelineTrackDragEnd = action((event) => {
		const {active, over} = event;
		console.log(active.id, over.id);
		if (active.id !== over.id) {
			const activeTrackId = active.data.current.trackId;
			const overTrackId = over.data.current.trackId;
			setTracks((tracks) => {
				const oldIndex = tracks.findIndex((value) => (value.trackId === activeTrackId));
				const newIndex = tracks.findIndex((value) => (value.trackId === overTrackId));
				return arrayMove(tracks, oldIndex, newIndex);
			});
		}
		setActiveTrackId(null);
	});

	useEffect(() => {
		let newTracks = [];
		for (let i = 0; i < trackCnt; i++) {
			newTracks.push({
				trackId: i,
				scenes: []
			});
		}
		for (let video of domainStore.videos) {
			const id = video.trackInfo.trackId;
			newTracks[id].scenes.push(video);
		}
		setTracks(newTracks);
	}, [domainStore.videos, trackCnt]);
		
	return (<div 
		className="bg-slate-300 m-5 flex-column overflow-scroll"
		style={{
			width: width
		}}
	>
		<TimelineLabels/>
		<DndContext
			sensors={ useSensors(
				useSensor(PointerSensor),
				useSensor(KeyboardSensor)
			)}
			modifiers={[
				restrictToFirstScrollableAncestor
			]}
			collisionDetection={closestCorners}
			onDragStart={onTimelineTrackDragStart}
			onDragEnd={onTimelineTrackDragEnd}
		>
			<SortableContext
				items={tracks}
				strategy={verticalListSortingStrategy}
			>
			{
				tracks.map(({ trackId, scenes }) => {
					const id = "track" + trackId;
					return (<DraggableTimelineTrack
						key={id}
						trackId={trackId}
						title={id}
						scenes={scenes}
					/>);
				})
			}
			</SortableContext>
			<DragOverlay>
				{
					activeTrackId ? 
					<TimelineTrack
						key={"track_overlay"}
						id={activeTrackId}
						title={"overlay"}
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
	
	return (<div className="bg-slate-100">
		<TimelineTracks />
	</div>);
});

export default NewTimeline;