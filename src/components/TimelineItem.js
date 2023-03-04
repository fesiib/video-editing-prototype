import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToParentElement, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { createRef, forwardRef, useEffect, useState } from "react";
import useRootContext from "../hooks/useRootContext";

const DraggableRangeHandle = observer(function DraggableRangeHandle({
	id, handleName
}) {

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
	} = useDraggable({
		id: id,
		transition: {
			duration: 150, // milliseconds
			easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
		},
		
	});

	const style = {
		transform: CSS.Transform.toString(transform),
	};

	return (<div 
		className="static"
		ref={setNodeRef}
		{...listeners}
		{...attributes}
		style={style}>
		<button> {handleName} </button>
	</div>);
});

const ResizeWrapper = observer(function ResizeWrapper({
	id,
	children
}) {
	const leftId = id + "leftHandler";
	const rightId = id + "rightHandler";

	return (<>
		<DndContext
			modifiers={[
				restrictToHorizontalAxis,
				restrictToFirstScrollableAncestor
			]}
		>
			<DraggableRangeHandle
				id={leftId}
				handleName={"left"}
			/>
		</DndContext>
		{children}
		<DndContext
			modifiers={[
				restrictToHorizontalAxis,
				restrictToFirstScrollableAncestor
			]}
		>
			<DraggableRangeHandle
				id={rightId}
				handleName={"right"}
			/>
		</DndContext>
	</>);
});

const TimelineItem = observer(forwardRef(function TimelineItem({
	scene, style, isOverlay, ...props
}, ref) {

	return (<div 
		className={"bg-indigo-400 w-20"}
		ref={ref}
		style={style}
		{...props}
	>
		{scene.id}
	</div>
	);
}));

const TimelineItemWrapper = observer(function TimelineItemWrapper({
	scene
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
	} = useDraggable({
		id: scene.id,
		data: {
			scene
		},
	});

	const style = transform ? {
		transform: `translate3d(${scene.x + transform.x}px, ${scene.y + transform.y}px, ${scene.z}px)`,
	} : {
		transform: `translate3d(${scene.x}px, ${scene.y}px, ${scene.z}px)`,
	}

	console.log(transform)

	return (
		<TimelineItem
			ref={setNodeRef}
			scene={scene}
			style={style}
			isOverlay={false}
			{...attributes}
			{...listeners}
		/>
	);

});

export default TimelineItemWrapper;