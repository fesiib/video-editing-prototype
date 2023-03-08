import { closestCenter, closestCorners, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { createSnapModifier, restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { forwardRef, useEffect, useState } from "react";
import useRootContext from "../hooks/useRootContext";
import { selectiveRestrictToVerticalAxis } from "../utilities/dndKitUtilities";
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
	id, title, scenes, isOverlay, isOver, ...props
}, ref) {

	const {
		uiStore,
		domainStore
	} = useRootContext();
	const width = uiStore.timelineConst.timelineMaxWidth;

	return (<div
		{...props}
		ref={ref}
	>
		<div
			className={ isOverlay ?
				"bg-slate-600 my-1 relative h-10" :
				( isOver ?
					"bg-slate-500 my-1 relative h-10" :
					"bg-slate-400 my-1 relative h-10"
				)
			}
			style={{
				width: width,
			}}
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
	</div>);
}));

const SortableTimelineTrack = observer(function SortableTimelineTrack({
	trackId, title, scenes
}) {
	const id = "track_" + trackId;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isOver,
		active
	} = useSortable({
		id: "sortable_" + id,
		data: {
			type: "track",
			trackId,
		},
		transition: {
			duration: 150, // milliseconds
			easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const isSceneOver = isOver && active.data.current.type === "scene";

	return (<TimelineTrack
		ref={setNodeRef}
		style={style}
		
		id={id}
		title={title}
		scenes={scenes}
		isOverlay={false}
		isOver={isSceneOver}

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
	const [activeItem, setActiveItem] = useState(null);

	const onGenericDragStart = action((event) => {
		const {active} = event;
		const type = active.data.current.type;
		console.log("start", type, event);

		if (type === "track") {
			setActiveTrackId(active.id);
		}
		else if (type === "scene") {
			setActiveItem(active);
		}
	});

	const onGenericDragOver = action((event) => {
		const {active} = event;
		const type = active.data.current.type;
		console.log("over", type, event);
	});

	const onGenericDragEnd = action((event) => {
		const {active, delta, over} = event;
		const type = active.data.current.type;
		console.log("end", type, event);

		if (type === "track") {
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
		}
		else if (type === "scene") {
			const scene = active.data.current.scene;
			scene.x += delta.x;
			scene.y += delta.y;			
			if (over) {
				const oldTrackId = scene.trackInfo.trackId;
				const newTrackId = over.data.current.trackId;
				if (newTrackId !== oldTrackId) {
					scene.trackInfo.trackId = newTrackId;
					scene.y = 0;
					setTracks((tracks) => {
						const oldIndex = tracks.findIndex((value) => (value.trackId === oldTrackId));
						const newIndex = tracks.findIndex((value) => (value.trackId === newTrackId));
						const sceneIndex = tracks[oldIndex].scenes.findIndex((curScene) => (curScene.id === scene.id));
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

			)}
			modifiers={[
				restrictToFirstScrollableAncestor
			]}
			collisionDetection={closestCorners}
			onDragStart={onGenericDragStart}
			//onDragOver={onGenericDragOver}
			onDragEnd={onGenericDragEnd}
		>
			<SortableContext
				items={tracks.map(({ trackId }) => "sortable_track_" + trackId)}
				strategy={verticalListSortingStrategy}
			>
			{
				tracks.map(({ trackId, scenes }) => {
					const id = "track_" + trackId;
					return (<SortableTimelineTrack
						key={id}
						trackId={trackId}
						title={id}
						scenes={scenes}
					/>);
				})
			}
			</SortableContext>
			<DragOverlay
				modifiers={ !!activeTrackId ? 
					[restrictToVerticalAxis] :
					[]
				}
				dropAnimation={null}
			>
			{
				activeTrackId ? 
				<TimelineTrack
					key={"track_overlay"}
					id={activeTrackId}
					title={"overlay"}
					scenes={[]}
					isOverlay={true}
					isOver={false}
				/>
				:
				null
			}
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
});

const NewTimeline = observer(function NewTimeline() {

	return (<div
		className="bg-slate-100"
	>
		<TimelineTracks />
	</div>);
});

export default NewTimeline;