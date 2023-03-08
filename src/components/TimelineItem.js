import { DndContext, useDraggable} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

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

export const TimelineItem = observer(forwardRef(function TimelineItem({
	scene, transform, isOverlay, ...props
}, ref) {

	const style = {
		...scene.timelineTransform(transform),
	};
	return (<div 
		className={ isOverlay ?
			"bg-yellow-600 w-20 absolute z-10" :
			"bg-yellow-400 w-20 absolute z-10"
		}
		ref={ref}
		style={style}
		{...props}
	>
		{isOverlay ? "overlay" : scene.id}
	</div>
	);
}));

const DraggableTimelineItem = observer(function TimelineItemWrapper({
	scene
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
	} = useDraggable({
		id: scene.id,
		data: {
			type: "scene",
			scene
		},
	});

	return (<TimelineItem
		ref={setNodeRef}
		scene={scene}
		transform={null}
		isOverlay={false}
		{...attributes}
		{...listeners}
	/>);

});

export default DraggableTimelineItem;