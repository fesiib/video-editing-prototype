import React, { useEffect, useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, autorun, set } from "mobx";

import { Image, Layer, Line, Rect, Stage } from "react-konva";

import useRootContext from "../../hooks/useRootContext";
import { Animation } from "konva/lib/Animation";

const SketchCanvas = observer(function SketchCanvas() {
	const sketchCanvasId = "sketch-canvas";
	
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
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
		uiStore.canvasControls.sketching = !uiStore.canvasControls.sketching;
	});
	const onCaptureFrameClick = action(() => {
		if (videoElement === null || curVideo === null || canDraw == false) {
			return;
		}
		const adaptedPlayPosition = uiStore.timelineControls.playPosition -
			curVideo.commonState.offset + curVideo.commonState.start;
		curIntent.setSketchPlayPosition(adaptedPlayPosition);
		return (() => {});
	});

	const onStageMouseDown = action((event) => {
		event.evt.preventDefault();
		if (!sketching) {
			return;
		}
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
			curIntent.setSketchCommand([...curIntent.sketchCommand, newRect]);
			setCurRect(null);
		}
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
		if (videoElement === null || curIntent === null) {
			return;
		}
		if (curIntent.sketchPlayPosition >= 0) {
			sketchRef.current.setAttrs({
				visible: true,
			});
			videoElement.currentTime = curIntent.sketchPlayPosition;
		}
		else {
			sketchRef.current.setAttrs({
				visible: false,
			});
		}
	}, [
		curIntent?.sketchPlayPosition,
		videoElement,
	]);

	return (<div id={sketchCanvasId} className="w-full border p-2">
		<div className="flex flex-row gap-2 justify-start">
			<button
				className="w-fit bg-indigo-300 hover:bg-indigo-400 text-black font-bold py-2 px-4 rounded"
				onClick={() => {
					onSketchClick();
				}}
			>
				{!sketching ? "Sketch" : "Done"}
			</button>
			{
				sketching ? (
					<button
						className="w-fit bg-indigo-300 hover:bg-indigo-400 text-black font-bold py-2 px-4 rounded"
						onClick={() => onCaptureFrameClick()}
					>
						Capture Frame
					</button>
				) : null
			}
			<button
				className="w-fit bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
				onClick={action(() => {
					setCurRect(null);
					curIntent.setSketchCommand([]);
				})}
				disabled={curIntent.sketchCommand.length === 0}
			>
				{(curIntent.sketchCommand.length === 0) ? "No Sketch" : "Clear"}
			</button>
		</div>
		<Stage
			ref={stageRef}
			className="my-2"
			width={stageWidth}
			height={stageHeight}
			onMouseDown={onStageMouseDown}
			onMouseMove={onStageMouseMove}
			onMouseUp={onStageMouseUp}
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
				{curIntent.sketchCommand.map((rect, i) => {
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
	</div>);
});

export default SketchCanvas;