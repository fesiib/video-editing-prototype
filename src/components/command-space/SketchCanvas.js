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
	
	const [stageWidth, setStageWidth] = useState(0);
	const [curRect, setCurRect] = useState(null);

	const video = domainStore.curVideo;

	const videoElement = useMemo(() => {
        const element = document.createElement("video");
        element.src = video?.source;
        element.loop = false;
        element.id = "sketch_element_" + video?.commonState?.id;
		// element.oncanplay = (event) => {
		// 	if (sketchRef.current === null) {
		// 		return;
		// 	}
		// 	event.target.muted = true;
		// 	const layer = sketchRef.current.getLayer();
		// 	const anim = new Animation(() => {}, layer);
		// 	anim.start();
		// 	console.log("anim start")
		// 	return () => {
		// 		console.log("return");
		// 		anim.stop()
		// 	};
		// };
		return element;
    }, [
		sketchPlayPosition
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
		//sketchRef.current.getLayer().draw();
		sketchRef.current.getLayer().getStage().draw();
	});

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

	useEffect(() => {
		if (video === null || sketchPlayPosition < 0) {
			return;
		}
		videoElement.currentTime = sketchPlayPosition;
		sketchRef.current.getLayer().getStage().draw();
	}, [curIntent.idx, video]);

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
						const pos = event.target.getStage().getPointerPosition();
						const x = pos.x;
						const y = pos.y;
						let newRect = {...curRect};
						newRect.width = x - curRect.x;
						newRect.height = y - curRect.y;
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
					clearBeforeDraw={false}
				>
					<Image
						id={"sketch" + video.commonState.id}
						name={"video"}
						ref={sketchRef}
						image={videoElement}
						//image={imageElement}
						x={0}
						y={0}
						width={stageWidth}
						height={stageWidth / video.commonState.width * video.commonState.height}
						// offsetX={video.commonState.width / 2}
						// offsetY={video.commonState.height / 2}
						scaleX={video.commonState.scaleX}
						scaleY={video.commonState.scaleY}
						// cropX={curVideo.commonState.cropX}
						// cropY={curVideo.commonState.cropY}
						// cropWidth={curVideo.commonState.cropWidth}
						// cropHeight={curVideo.commonState.cropHeight}
						draggable={false}
						visible={true}
						perfectDrawEnabled={false}
					/>
				</Layer>
				<Layer>
					{curIntent.sketchCommand.map((rect, i) => {
						return <Rect
							key={i}
							x={rect.x}
							y={rect.y}
							width={rect.width}
							height={rect.height}
							stroke={rect.stroke}
							strokeWidth={rect.strokeWidth}
							lineCap={rect.lineCap}
							lineJoin={rect.lineJoin}
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