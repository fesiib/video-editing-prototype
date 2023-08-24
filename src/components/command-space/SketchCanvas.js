import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { Layer, Line, Stage } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

const SketchCanvas = observer(function SketchCanvas() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const sketching = uiStore.canvasControls.sketching;
	const [isDrawing, setIsDrawing] = useState(false);

	const onSketchClick = action(() => {
		uiStore.canvasControls.sketching = !uiStore.canvasControls.sketching;
	});

	return (<div>
		<div className="flex flex-row justify-between">
			<button
				className="w-fit bg-indigo-300 hover:bg-indigo-400 text-black font-bold py-2 px-4 rounded"
				onClick={onSketchClick}
			>
				{!sketching ? "Sketch" : "Done"}
			</button>
			{!sketching ? null : (
				<button
					className="w-fit bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
					onClick={action(() => {
						setIsDrawing(false);
						curIntent.sketchCommand = [];
					})}
				>
					Clear
				</button>
			)}
		</div>
		{!sketching ? null : (
			<Stage
				width={uiStore.canvasSize.width}
				height={uiStore.canvasSize.height}
				style={{
					border: "1px solid black",
					margin: "auto",
					backgroundColor: "white",
				}}
				onMouseDown={action((event) => {
					if (!sketching) {
						return;
					}
					setIsDrawing(true);
					const pos = event.target.getStage().getPointerPosition();
					const x = pos.x;
					const y = pos.y;
					const newLine = {
						points: [x, y],
						stroke: "black",
						strokeWidth: 5,
						lineCap: "round",
						lineJoin: "round",
					};
					curIntent.sketchCommand.push(newLine);
				})}
				onMouseMove={action((event) => {
					if (!sketching) {
						return;
					}
					if (isDrawing) {
						const pos = event.target.getStage().getPointerPosition();
						const x = pos.x;
						const y = pos.y;
						const lastLine = curIntent.sketchCommand[curIntent.sketchCommand.length - 1];
						lastLine.points = lastLine.points.concat([x, y]);
					}
				})}
				onMouseUp={action((event) => {
					if (!sketching) {
						return;
					}
					setIsDrawing(false);
					const pos = event.target.getStage().getPointerPosition();
					const x = pos.x;
					const y = pos.y;
					const lastLine = curIntent.sketchCommand[curIntent.sketchCommand.length - 1];
					lastLine.points = lastLine.points.concat([x, y]);
				})}
			>
				<Layer>
					{curIntent.sketchCommand.map((line, i) => {
						return <Line
							key={i}
							points={line.points}
							stroke={line.stroke}
							strokeWidth={line.strokeWidth}
							lineCap={line.lineCap}
							lineJoin={line.lineJoin}
						/>
					})}
				</Layer>
			</Stage>
		)}
	</div>);
});

export default SketchCanvas;