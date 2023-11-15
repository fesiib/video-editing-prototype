import React, { useEffect, useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, autorun, reaction, set } from "mobx";

import { Image, Layer, Line, Rect, Stage } from "react-konva";

import useRootContext from "../../hooks/useRootContext";
import { Animation } from "konva/lib/Animation";
import { roundNumber } from "../../utilities/genericUtilities";
import CaptureIcon from "../../icons/CaptureIcon";
import SketchIcon from "../../icons/SketchIcon";
import HideIcon from "../../icons/HideIcon";

import { BiTime } from "react-icons/bi";
import { MdOutlineDraw } from "react-icons/md";
import { MdOutlineDoneOutline } from "react-icons/md";
import { TbCaptureFilled } from "react-icons/tb";
import { AiOutlineClear } from "react-icons/ai";

const SketchCanvas = observer(function SketchCanvas(
	{ shouldSketch }
) {
	const sketchCanvasId = "sketch-canvas";
	
	const { uiStore, domainStore } = useRootContext();
	const curTab = domainStore.curTab;
	const sketching = uiStore.canvasControls.sketching;
	const minWidth = uiStore.canvasConst.minWidth;
	const minHeight = uiStore.canvasConst.minHeight;

	const sketchRef = useRef(null);
	const stageRef = useRef(null);
	const sketchLayerRef = useRef(null);
	const rectsLayerRef = useRef(null);
	
	const [stageWidth, setStageWidth] = useState(minWidth);
	const [stageHeight, setStageHeight] = useState(minHeight);
	const [curRect, setCurRect] = useState(null);
	const [canDraw, setCanDraw] = useState(false);

	const curVideo = domainStore.curVideo;

	const videoWidth = curVideo?.commonState?.width ? curVideo?.commonState?.width : minWidth;
	const videoHeight = curVideo?.commonState?.height ? curVideo?.commonState?.height : minHeight;
	const videoSource = curVideo?.source ? curVideo?.source : "";
	const videoId = curVideo?.commonState?.id ? curVideo?.commonState?.id : "";

	const videoElement = useMemo(() => {
        const element = document.createElement("video");
        element.src = videoSource;
        element.loop = false;
        element.id = "sketch_element_" + videoId;
		element.oncanplay = (event) => {
			if (sketchRef.current === null) {
				return;
			}
			event.target.muted = true;
			event.target.pause();
			const layer = sketchRef.current.getLayer();
			const anim = new Animation(() => {}, layer);
			anim.start();
			return () => anim.stop();
		};
		element.onloadedmetadata = (event) => {
			setCanDraw(true);
		};
		return element;
    }, [
		videoSource, videoId
	]);

	const onSketchClick = action(() => {
		if (uiStore.canvasControls.sketching) {
			uiStore.canvasControls.sketching = false;
			return;
		}
		onClearClick();
		onCaptureFrameClick();
		uiStore.canvasControls.sketching = true;
		uiStore.logData("sketchClick", null);
	});
	const onCaptureFrameClick = action(() => {
		if (videoElement === null
			|| curVideo === null
			|| canDraw == false
			//|| sketchRef.current === null
		) {
			return;
		}
		const adaptedPlayPosition = uiStore.timelineControls.playPosition -
			curVideo.commonState.offset + curVideo.commonState.start;
		curTab.setSketchPlayPosition(adaptedPlayPosition);
		return (() => {});
	});

	const onClearClick = action(() => {
		setCurRect(null);
		curTab.setSketchCommand([]);
		uiStore.logData("sketchClear", null);
	});

	const onJumpClick = action(() => {
		if (videoElement === null
			|| curVideo === null
			|| canDraw == false
			|| sketchRef.current === null
		) {
			return;
		}
		uiStore.timelineControls.playPosition = curTab.sketchPlayPosition;
		uiStore.logData("sketchJump", null);
		return (() => {});
	});

	const onStageMouseDown = action((event) => {
		event.evt.preventDefault();
		if (!sketching) {
			return;
		}
		onClearClick();
		const pos = event.target.getStage().getPointerPosition();
		const x = pos.x;
		const y = pos.y;
		const newRect = {
			x: x,
			y: y,
			width: 0,
			height: 0,
			stroke: "red",
			strokeWidth: 2,
			lineCap: "round",
			lineJoin: "round",
		};
		setCurRect(newRect);
	})

	const onStageMouseMove = action((event) => {
		event.evt.preventDefault();
		if (!sketching) {
			return;
		}
		if (curRect !== null) {
			const pos = event.target.getStage().getPointerPosition();
			const x = pos.x;
			const y = pos.y;
			let newRect = {...curRect};
			newRect.width = x - curRect.x;
			newRect.height = y - curRect.y;
			newRect.x = Math.max(0, newRect.x);
			newRect.y = Math.max(0, newRect.y);
			newRect.width = Math.min(stageWidth - newRect.x, newRect.width);
			newRect.height = Math.min(stageHeight - newRect.y, newRect.height);
			setCurRect(newRect);
		}
	});

	const onStageMouseUp = action((event) => {
		event.evt.preventDefault();
		if (!sketching) {
			return;
		}
		if (curRect !== null) {
			const pos = event.target.getStage().getPointerPosition();
			const x = pos.x;
			const y = pos.y;
			let newRect = {...curRect};
			newRect.width = x - curRect.x;
			newRect.height = y - curRect.y;
			if (newRect.width < 0) {
				newRect.x = newRect.x + newRect.width;
				newRect.width = -newRect.width;
			}
			if (newRect.height < 0) {
				newRect.y = newRect.y + newRect.height;
				newRect.height = -newRect.height;
			}
			newRect.x = Math.max(0, newRect.x);
			newRect.y = Math.max(0, newRect.y);
			newRect.width = Math.min(stageWidth - newRect.x, newRect.width);
			newRect.height = Math.min(stageHeight - newRect.y, newRect.height);

			newRect.x = newRect.x / stageWidth * videoWidth;
			newRect.y = newRect.y / stageHeight * videoHeight;
			newRect.width = newRect.width / stageWidth * videoWidth;
			newRect.height = newRect.height / stageHeight * videoHeight;						
			if (newRect.width < minWidth || newRect.height < minHeight) {
				setCurRect(null);
				return;
			}
			uiStore.logData("sketchDraw", {
				x: newRect.x,
				y: newRect.y,
				width: newRect.width,
				height: newRect.height,
				timestamp: curTab.sketchPlayPosition,
			});
			curTab.setSketchCommand([...curTab.sketchCommand, newRect]);
			setCurRect(null);
		}
	});

	const onStageMouseLeave = action((event) => {
		event.evt.preventDefault();
		if (!sketching) {
			return;
		}
	});

	const onSketchTextClick = action(() => {
		onSketchClick();
		uiStore.logData("sketchNoticeClick", null);
	});

	useEffect(() => {
		const div = document.getElementById(sketchCanvasId);
		if (curVideo === null || div === null) {
			return;
		}
		let newStageWidth = div.clientWidth - 20;
		if (!sketching) {
			newStageWidth = newStageWidth / 6;
		}
		setStageWidth(newStageWidth);
		setStageHeight(newStageWidth / videoWidth * videoHeight);
	}, [sketching, videoWidth, videoHeight]);

	useEffect(() => {
		const disposer = reaction(() => uiStore.timelineControls.playPosition, (playPosition) => {
			if (videoElement === null || curTab === null || sketchRef.current === null) {
				return;
			}
			if (curTab.sketchCommand.length === 0) {
				onCaptureFrameClick();
			}
		});
		return () => {
			disposer();
		}
	})


	useEffect(() => {
		if (videoElement === null || curTab === null || sketchRef.current === null) {
			return;
		}
		if (curTab.sketchPlayPosition >= 0) {
			sketchRef.current.setAttrs({
				visible: true,
			});
			videoElement.currentTime = curTab.sketchPlayPosition;
		}
		else {
			sketchRef.current.setAttrs({
				visible: false,
			});
		}
	}, [
		sketchRef.current,
		curTab?.sketchPlayPosition,
		videoElement,
	]);

	return (<div id={sketchCanvasId} className="w-full">
		{
			(!uiStore.commandSpaceControls.requestingAmbiguousParts 
				&& !uiStore.canvasControls.sketching && shouldSketch) ? (
					<div
						className="text-sm cursor-pointer hover:underline text-blue-500 p-1"
						onClick={onSketchTextClick}
					>  Specify a region of interest for improved results
					</div>
				) : null
		}
		<div className="flex flex-row justify-between w-full pr-5">
			<div className="flex flex-row gap-2 justify-start">
				<button
					className="w-fit bg-indigo-200 hover:bg-indigo-300 text-black p-1 rounded"
					onClick={() => {
						onSketchClick();
					}}
				>
					{!sketching ? (
						<div className="flex flex-row item-center gap-1">
							<MdOutlineDraw />
							<span className="font-bold">
								Sketch
							</span>
						</div>
					) : (
						<div className="flex flex-row item-center gap-1">
							<MdOutlineDoneOutline />
						</div>
					)}
				</button>
				{
					// sketching ? (
					// 	<button
					// 		className="w-fit bg-indigo-200 hover:bg-indigo-300 text-black p-1 rounded disabled:opacity-50"
					// 		onClick={() => onCaptureFrameClick()}
					// 		disabled={!canDraw || curTab.sketchPlayPosition === uiStore.timelineControls.playPosition}
					// 	>
					// 		{/* Capture Fram */}
					// 		<TbCaptureFilled />
					// 	</button>
					// ) : null
				}
				{
					curTab.sketchCommand.length === 0 ? null : (
						
						<button
							className="w-fit bg-gray-300 hover:bg-gray-400 text-black p-1 rounded"
							onClick={() => onClearClick()}
						>
							<div className="flex flex-row item-center gap-1">
								<AiOutlineClear />
								<span className="font-bold">
									Clear
								</span>
							</div>
						</button>
					)
				}
			</div>
			{
				sketching && curTab.sketchPlayPosition >= 0 ? (
					<button
						className="w-fit bg-indigo-200 hover:bg-indigo-300 text-black p-1 rounded disabled:opacity-50 disabled:hover:bg-indigo-200"
						onClick={() => onJumpClick()}
						disabled={curTab.sketchPlayPosition === uiStore.timelineControls.playPosition}
					>
						<BiTime />
					</button>
				) : null
			}
		</div>
		{
			(!sketching && curTab.sketchCommand.length === 0) ? null : (
				<Stage
					ref={stageRef}
					className="my-2"
					width={stageWidth}
					height={stageHeight}
					onMouseDown={onStageMouseDown}
					onMouseMove={onStageMouseMove}
					onMouseUp={onStageMouseUp}
					onMouseLeave={onStageMouseUp}
				>
					<Layer
						ref={sketchLayerRef}
					>
						<Rect
							x={0}
							y={0}
							width={stageWidth}
							height={stageHeight}
							fill="black"
							draggable={false}
							visible={true}
							perfectDrawEnabled={false}
						/>
						<Image
							id={"sketch" + videoId}
							name={"video"}
							ref={sketchRef}
							image={videoElement}
							x={0}
							y={0}
							width={stageWidth}
							height={stageHeight}
							scaleX={1}
							scaleY={1}
							draggable={false}
							visible={false}
							perfectDrawEnabled={false}
						/>
					</Layer>
					<Layer
						ref={rectsLayerRef}
					>
						{curTab.sketchCommand.map((rect, i) => {
							const adaptedRect = {
								x: rect.x / videoWidth * stageWidth,
								y: rect.y / videoHeight * stageHeight,
								width: rect.width / videoWidth * stageWidth,
								height: rect.height / videoHeight * stageHeight,
								stroke: rect.stroke,
								strokeWidth: rect.strokeWidth,
								lineCap: rect.lineCap,
								lineJoin: rect.lineJoin,
							};
							return <Rect
								key={`rect${i}`}
								x={adaptedRect.x}
								y={adaptedRect.y}
								width={adaptedRect.width}
								height={adaptedRect.height}
								stroke={adaptedRect.stroke}
								strokeWidth={adaptedRect.strokeWidth}
								lineCap={adaptedRect.lineCap}
								lineJoin={adaptedRect.lineJoin}
							/>
						})}
						{curRect === null ? null : (
							<Rect
								x={curRect.x}
								y={curRect.y}
								width={curRect.width}
								height={curRect.height}
								stroke={curRect.stroke}
								strokeWidth={curRect.strokeWidth}
								lineCap={curRect.lineCap}
								lineJoin={curRect.lineJoin}
							/>
						)}
					</Layer>
				</Stage>
			)

		}
		{/* <div className={"text-sm flex flex-col"}>
			<div>
				Video: {domainStore.projectMetadata.width} x {domainStore.projectMetadata.height}
			</div>
			{
				curTab.sketchPlayPosition >= 0 ? (
					<span > Time (seconds): {curTab.sketchPlayPosition}</span>
				) : null
			}
			{
				curTab.sketchCommand.map((rect, i) => {
					const outputRect = {
						x: roundNumber(rect.x, 2),
						y: roundNumber(rect.y, 2),
						width: roundNumber(rect.width, 2),
						height: roundNumber(rect.height, 2),
					}
					return <span key={`rect${i}`}>
						{`Rect ${i}: [${outputRect.x}, ${outputRect.y}, ${outputRect.width}, ${outputRect.height}]`}
					</span>
				})
			}
		</div> */}
	</div>);
});

export default SketchCanvas;