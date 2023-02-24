import { action } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { Layer, Rect, Stage } from "react-konva";

const TimelineLabels = observer(function TimelineLabels({
	uiStore, domainStore
}) {
	// uiStore.timelineControls.scalePos

	// uiStore.timelineConst.labelStep

	return (<>
		<Rect
			x={0}
			y={0}
			width={uiStore.timelineSize.width}
			height={uiStore.timelineConst.labelHeight}
			fill="red"
		/>

	</>);
});

const TimelinePositionIndicator = observer(function TimelinePositionIndicator({
	uiStore, domainStore
}) {
	const onIndicatorDrag = action((event) => {
		event.target.y(0);
		event.target.x(Math.max(event.target.x(), 0));
		event.target.x(Math.min(event.target.x(), uiStore.timelineSize.width));
		uiStore.timelineControls.playPosition = event.target.x();
	});

	return (<>
		<Rect
			x={uiStore.timelineControls.playPosition}
			y={0}
			height={uiStore.timelineSize.height}
			width={uiStore.timelineConst.positionIndicatorWidth}
			offsetX={uiStore.timelineConst.positionIndicatorWidth / 2}
			fill="blue"
			onDragMove={onIndicatorDrag}
			draggable
		/>
	</>);
});

const Timeline = observer(function Timeline({ uiStore, domainStore }) {
    const scrollContainerRef = useRef(null);
	const stageRef = useRef(null);
	const padding = 100;

	useEffect(() => {
		if (!scrollContainerRef.current || !stageRef.current) {
			return;
		}
		const onScrollRepositionStage = () => {
			let dx = scrollContainerRef.current.scrollLeft - padding;
			let dy = scrollContainerRef.current.scrollTop - padding;
			console.log(dx, dy);
			stageRef.current.container().style.transform =
				'translate(' + dx + 'px, ' + dy + 'px)';
			stageRef.current.x(-dx);
			stageRef.current.y(-dy);
		}
		scrollContainerRef.current.addEventListener("scroll", onScrollRepositionStage);
		onScrollRepositionStage();
		return () => scrollContainerRef.current.removeEventListener("scroll", onScrollRepositionStage);
	}, [scrollContainerRef, stageRef]);

	return (
        <>
            <div>Timeline</div>
			<div ref={scrollContainerRef} 
				id="scroll-container"
				className={"overflow-auto"}
				style={{
					width: uiStore.timelineSize.width + "px",
					height: uiStore.timelineSize.height + "px",
				}}
			>
				<div id="large-conatiner" className={"overflow-hidden"}
					style={{
						width: uiStore.timelineConst.timelineMaxWidth,
						height: uiStore.timelineConst.timelineMaxHeight,
						
					}}
				>
					<Stage 
						ref={stageRef}
						width={uiStore.timelineSize.width + padding * 2}
						height={uiStore.timelineSize.height + padding * 2}
					>
						<Layer>
							<Rect
								x={0}
								y={0}
								width={uiStore.timelineSize.width}
								height={uiStore.timelineSize.height}
								fill="green"
							/>
							<Rect
								x={1}
								y={1}
								width={uiStore.timelineSize.width / 2}
								height={uiStore.timelineSingleLineHeight}
								fill="black"
								draggable
							/>
							<TimelinePositionIndicator
								uiStore={uiStore}
								domainStore={domainStore}
							/>
							<TimelineLabels
								uiStore={uiStore}
								domainStore={domainStore}
							/>
						</Layer>
					</Stage>
				</div>
			</div>
        </>
    );
});

export default Timeline;
