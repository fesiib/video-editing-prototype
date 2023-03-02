import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToParentElement, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { forwardRef, useState } from "react";
import useRootContext from "../hooks/useRootContext";

const DraggableRangeHandle = observer(function DraggableRangeHandle({
	id, handleName,
}) {

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
	} = useDraggable({
		id: id + handleName,
		transition: {
			duration: 150, // milliseconds
			easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
		},
		
	});

	const style = {
		transform: CSS.Transform.toString(transform),
	};

	return (<div ref={setNodeRef} {...listeners} {...attributes} style={style}>
		<button> {handleName} </button>
	</div>);
});

const TimelineItem = observer(forwardRef(function TimelineItem({
	scene, ...props
}, ref) {
	return (<div 
		className="bg-slate-600 m-5"
		ref={ref}
		{...props}
	>
		{scene}
	</div>);
}));

const SortableTimelineItem = observer(function SortableTimelineItem({
	id, ...props
}) {
	const {
		uiStore,
		domainStore
	} = useRootContext();

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		id: id,
		transition: {
			duration: 150, // milliseconds
			easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const droppableProps = useDroppable({
		id: id + "droppable"
	});

	return (
		<DndContext
			modifiers={[
				restrictToFirstScrollableAncestor,
				restrictToHorizontalAxis,
			]}
		>
			<div className="flex" ref={droppableProps.setNodeRef}>
				
				<DraggableRangeHandle
					id={id}
					handleName={"left"}
				/>
				<TimelineItem
					ref={setNodeRef}
					style={style}
					{...attributes}
					{...listeners}
					{...props}
				/>
				<DraggableRangeHandle
					id={id}
					handleName={"right"}
				/>
		</div>
		</DndContext>
	);

});

const TimelineItems = observer(function TimelineItems({
}) {
	const [items, setItems] = useState(['1', '2', '3', '4', '5']);
	const [activeItemId, setActiveItemId] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const onTimelineItemDragStart = (event) => {
		const {active} = event;
		setActiveItemId(active.id);
	}

	const onTimelineItemDragEnd = action((event) => {
		const {active, over} = event;

		if (active.id !== over.id) {
			setItems((items) => {
				const oldIndex = items.indexOf(active.id);
				const newIndex = items.indexOf(over.id);
				
				return arrayMove(items, oldIndex, newIndex);
			});
		}
		setActiveItemId(null);
	});

	return (<div className="bg-slate-400 m-5 flex">
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={onTimelineItemDragStart}
			onDragEnd={onTimelineItemDragEnd}
		>
			<SortableContext 
				items={items}
				strategy={horizontalListSortingStrategy}
			>
			{
				items.map((id => (
					<SortableTimelineItem key={id} id={id} scene={"LOL" + id}/>
				)))
			}
			</SortableContext>
			<DragOverlay
				className="bg-slate-500"
				dropAnimation={null}
				modifiers={[
					restrictToHorizontalAxis,
					restrictToFirstScrollableAncestor
				]}
			>
				{
					activeItemId ? 
					<TimelineItem 
						id={activeItemId}
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
		<TimelineItems />
	</div>);
});

export default NewTimeline;