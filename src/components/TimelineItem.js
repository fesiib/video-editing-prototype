import { DndContext, useDraggable} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";
import useRootContext from "../hooks/useRootContext";

const DraggableRangeHandle = observer(function DraggableRangeHandle({
	scene, isLeftHandler
}) {

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
	} = useDraggable({
		id: scene.id + (isLeftHandler ? "leftHandler" : "rightHandler"),
		transition: {
			duration: 150, // milliseconds
			easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
		},
		data: {
			scene,
			isLeftHandler,
		}
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
		<button> {isLeftHandler ? "L" : "R"} </button>
	</div>);
});

const ResizeWrapper = observer(function ResizeWrapper({
	scene,
	children
}) {

	const {
		uiStore
	} = useRootContext();

	const onHandlerDragEnd = action((event) => {
		const {active, delta} = event;
		const scene = active.data.current.scene;
		const isLeftHandler = active.data.current.isLeftHandler;
		if (isLeftHandler) {
			scene.start += uiStore.pxToSec(delta.x);
			scene.duration += -uiStore.pxToSec(delta.x);
		}
		else {
			scene.duration += uiStore.pxToSec(delta.x);
		}
	});

	return (<>
		<DndContext
			modifiers={[
				restrictToHorizontalAxis,
				restrictToFirstScrollableAncestor
			]}
			onDragEnd={onHandlerDragEnd}
		>
			<DraggableRangeHandle
				scene={scene}
				isLeftHandler={true}
			/>
			{children}
			<DraggableRangeHandle
				scene={scene}
				isLeftHandler={false}
			/>
		</DndContext>
	</>);
});

export const TimelineItem = observer(forwardRef(function TimelineItem({
	scene, transform, isOverlay, ...props
}, ref) {
	const {
		uiStore
	} = useRootContext();

	const style = {
		transform: ( transform ?
			`translate3d(${uiStore.secToPx(scene.start) + transform.x}px, ${0 + transform.y}px, ${0}px)` :
			`translate3d(${uiStore.secToPx(scene.start)}px, ${0}px, ${0}px)`
		),
		width: uiStore.secToPx(scene.duration),
	};

	const onPointerOver = (event) => console.log(event);

	return (<div 
		className={ isOverlay ?
			"bg-yellow-600 absolute z-10" :
			"bg-yellow-400 absolute z-10"
		}
		ref={ref}
		style={style}
		{...props}
	>
		{isOverlay ?
			"overlay" :
			<div className="flex justify-between">
				<ResizeWrapper scene={scene}>
					{scene.id}
				</ResizeWrapper>
			</div>
		}
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