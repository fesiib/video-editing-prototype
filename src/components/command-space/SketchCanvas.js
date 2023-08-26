import React, { createRef, useEffect, useMemo, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, set } from "mobx";

import { Image, Layer, Line, Rect, Stage } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

const SketchCanvas = observer(function SketchCanvas() {
	const sketchCanvasId = "sketch-canvas";
	
	const { uiStore, domainStore } = useRootContext();
	
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const sketchPlayPosition = curIntent.sketchPlayPosition;
	const sketching = uiStore.canvasControls.sketching;
	const minWidth = uiStore.canvasConst.minWidth;
	const minHeight = uiStore.canvasConst.minHeight;

	const sketchRef = createRef(null);
	const stageRef = createRef(null);
	const sketchLayerRef = createRef(null);
	
	const [stageWidth, setStageWidth] = useState(0);
	const [curRect, setCurRect] = useState(null);

	const video = domainStore.curVideo;

	const videoElement = useMemo(() => {
        const element = document.createElement("video");
        element.src = video?.source;
        element.loop = false;
        element.id = "sketch_element_" + video?.commonState?.id;
		return element;
    }, [
		video?.source, video?.commonState?.id
	]);

	const onSketchClick = action(() => {
		uiStore.canvasControls.sketching = !uiStore.canvasControls.sketching;
	});
	const onCaptureFrameClick = action(() => {
		if (videoElement === null || video === null) {
			return;
		}
		const adaptedPlayPosition = uiStore.timelineControls.playPosition -
			video.commonState.offset + video.commonState.start;
		videoElement.currentTime = adaptedPlayPosition;
		curIntent.setSketchPlayPosition(adaptedPlayPosition);
		window.requestAnimationFrame(() => {
			console.log("capture", sketchLayerRef.current);
			sketchLayerRef.current.draw();
		});
		return (() => {
		});
	});

	useEffect(() => {
		if (video === null || sketchPlayPosition < 0) {
			return;
		}
		videoElement.currentTime = sketchPlayPosition;
		window.requestAnimationFrame(() => {
			console.log("update", sketchLayerRef.current);
			sketchLayerRef.current.draw();
		});
		return (() => {
			
		});
	}, [curIntent.idx, video]);

	useEffect(() => {
		if (video === null) {
			return;
		}
		const div = document.getElementById(sketchCanvasId);
		if (sketching) {
			setStageWidth(div.clientWidth - 20);
			return;
		}
		setStageWidth((div.clientWidth - 20) / 10);		
	}, [sketching, video]);

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
				{curIntent.sketchCommand.length === 0 ? "No Sketch" : "Clear"}
			</button>
		</div>
		{video === null ? null : (
			<Stage
				ref={stageRef}
				className="my-2"
				width={stageWidth}
				height={stageWidth / video.commonState.width * video.commonState.height}
				onMouseDown={action((event) => {
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
				})}
				onMouseMove={action((event) => {
					event.evt.preventDefault();
					if (!sketching) {
						return;
					}
					if (curRect !== null) {
						const stageHeight = stageWidth / video.commonState.width * video.commonState.height;

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
				})}
				onMouseUp={action((event) => {
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
						const stageHeight = stageWidth / video.commonState.width * video.commonState.height;

						newRect.x = Math.max(0, newRect.x);
						newRect.y = Math.max(0, newRect.y);
						newRect.width = Math.min(stageWidth - newRect.x, newRect.width);
						newRect.height = Math.min(stageHeight - newRect.y, newRect.height);

						newRect.x = newRect.x / stageWidth * video.commonState.width;
						newRect.y = newRect.y / stageHeight * video.commonState.height;
						newRect.width = newRect.width / stageWidth * video.commonState.width;
						newRect.height = newRect.height / stageHeight * video.commonState.height;						
						if (newRect.width < minWidth || newRect.height < minHeight) {
							setCurRect(null);
							return;
						}
						curIntent.setSketchCommand([...curIntent.sketchCommand, newRect]);
						setCurRect(null);
					}
				})}
			>
				<Layer
					ref={sketchLayerRef}
				>
					<Rect
						x={0}
						y={0}
						width={stageWidth}
						height={stageWidth / video.commonState.width * video.commonState.height}
						fill="black"
						draggable={false}
						visible={true}
						perfectDrawEnabled={false}
					/>
					<Image
						id={"sketch" + video.commonState.id}
						name={"video"}
						ref={sketchRef}
						image={videoElement}
						x={0}
						y={0}
						width={stageWidth}
						height={stageWidth / video.commonState.width * video.commonState.height}
						scaleX={video.commonState.scaleX}
						scaleY={video.commonState.scaleY}
						draggable={false}
						visible={true}
						perfectDrawEnabled={false}
					/>
				</Layer>
				<Layer>
					{curIntent.sketchCommand.map((rect, i) => {
						const stageHeight = stageWidth / video.commonState.width * video.commonState.height;
						const adaptedRect = {
							x: rect.x / video.commonState.width * stageWidth,
							y: rect.y / video.commonState.height * stageHeight,
							width: rect.width / video.commonState.width * stageWidth,
							height: rect.height / video.commonState.height * stageHeight,
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
		)}
	</div>);
});

export default SketchCanvas;