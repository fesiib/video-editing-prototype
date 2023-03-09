import { closestCenter, closestCorners, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { createSnapModifier, restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { forwardRef, useEffect, useMemo, useState } from "react";
import useRootContext from "../hooks/useRootContext";
import IndicatorIcon from "../icons/IndicatorIcon";
import { selectiveRestrictToVerticalAxis } from "../utilities/dndKitUtilities";
import { secondsToFormat } from "../utilities/timelineUtilities";
import DraggableTimelineItem, { TimelineItem } from "./TimelineItem";

const TimelinePositionIndicator = observer(function TimelinePositionIndicator({}) {
	const {
		uiStore,
	} = useRootContext();

	const width = uiStore.trackWidthPx;
	const height = uiStore.timelineSize.height;
	const labelIntervalPx = uiStore.timelineConst.labelIntervalPx;

	const playPositionPx = uiStore.secToPx(uiStore.timelineControls.playPosition);
	const playIndicatorWidth = 8;

	const {
		setNodeRef,
		listeners,
		attributes,
		transform,
		isDragging
	} = useDraggable({
		id: "position_indicator"
	});

	const curPlayPosition = (uiStore.timelineControls.playPosition + 
		(transform ? uiStore.pxToSec(transform.x) : 0) );
	return (<>
		<div
			className={isDragging ?
				"absolute z-20 bg-violet-500" :
				"absolute z-20 hover:bg-violet-500"
			}
			style={{
				height: height,
				left: playPositionPx - (playIndicatorWidth / 2),
				transform: CSS.Transform.toString(transform)
			}}
			ref={setNodeRef}
			{...listeners}
			{...attributes}
		>
			{
				isDragging ? (<label
					className="absolute z-30 bg-violet-800 text-white text-xs"
					style={{
						left: playIndicatorWidth,
					}}
					htmlFor="position_indicator_button"
				> { secondsToFormat(curPlayPosition) } </label>)
				: null
			}
			<button 
				type="button"
				id="position_indicator_button"
				style={{
					width: playIndicatorWidth,
					height: height,
				}}
			>
				<div
					className="mx-auto"
					style={{
						width: 2,
						height: height,
						background: "black",
					}}
				/>

			</button>
		</div>
	</>);
});

const TimelineLabels = observer(function TimelineLabels() {
	const {
		uiStore,
	} = useRootContext();

	const width = uiStore.trackWidthPx;
	const height = uiStore.timelineConst.labelHeight;
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
		const {delta} = event;
		uiStore.timelineControls.playPosition += uiStore.pxToSec(delta.x);
	});

	return (<DndContext
		modifiers={[
			restrictToHorizontalAxis,
		]}
		onDragEnd={onIndicatorDragEnd}
	>
		<div 
			className={"bg-slate-500 flex relative"}
			style={{
				width: width,
				height: height,
			}}
		>
			{
				labels.map((timestamp) => {
					return (<span
						key={"label" + timestamp}
						className={"text-xs text-right border-r-2"}
						style={{
							width: labelIntervalPx,
							height: uiStore.timelineConst.labelHeight,
						}}
					>
						{secondsToFormat(timestamp)}
					</span>);
				})
			}

			<TimelinePositionIndicator/>
		</div>
	</DndContext>);
});

const TimelineTrack = observer(forwardRef(function TimelineTrack({
	id, title, scenes, isOverlay, isOver, ...props
}, ref) {

	const {
		uiStore,
	} = useRootContext();
	const width = uiStore.trackWidthPx;

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
			scene.start += uiStore.pxToSec(delta.x);
			if (over) {
				const oldTrackId = scene.trackInfo.trackId;
				const newTrackId = over.data.current.trackId;
				if (newTrackId !== oldTrackId) {
					scene.trackInfo.trackId = newTrackId;
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
			width: width,
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

	const {
		uiStore
	} = useRootContext();

	const onZoomChange = action((event) => {
		uiStore.timelineControls.pxPerSec = event.target.value;
	});

	return (<div
		className="bg-slate-100"
	>
		<div className="flex justify-between">
			<div>
				<label htmlFor="play_button" className="bg-indigo-300 p-1" > Play </label>
				<input
					id="play_button"
					type="button"
				/>
			</div>
			<div>
				<label htmlFor="split_button" className="bg-indigo-300 p-1" > Split </label>
				<input
					id="split_button"
					type="button"
				/>
			</div>
			<div>
				<label htmlFor="speed_input" className="bg-indigo-300 p-1" > Speed </label>
				<input
					id="speed_input"
					type="number"
					style={{
						width: 50
					}}
					step={0.25}
				/>
			</div>
			<div>
				<label htmlFor="timelinen_zoom"> Pixels per second {uiStore.timelineControls.pxPerSec} </label>
				<input
					id="timeline_zoom"
					type={"range"}
					min={10}
					max={100}
					value={uiStore.timelineControls.pxPerSec}
					onChange={onZoomChange}
					step={10}
				/>
			</div>
		</div>

		<TimelineTracks />
	</div>);
});

export default NewTimeline;