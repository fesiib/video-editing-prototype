import { Animation } from "konva/lib/Animation";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef } from "react";
import { Image, Layer, Rect, Stage, Transformer } from "react-konva";

const DraggableVideo = observer(function DraggableVideo({
	domainStore
}) {
	const imageRef = useRef(null);
	const trRef = useRef(null);
	const curVideo = domainStore.videos[0];
	const videoElement = useMemo(() => {
		const element = document.createElement('video');
		element.src = curVideo.source;
		return element;
	}, [curVideo.source]);

	const onLoadedMetadata = () => {
		const metadata = {
			duration: videoElement.duration,
			videoWidth: videoElement.videoWidth, 
			videoHeight: videoElement.videoHeight,
		};
		curVideo.setMetadata(metadata);
	};

	useEffect(() => {
		videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
		return () => {
			videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
		}
	}, [videoElement]);

	const onCanPlay = () => {
		videoElement.muted = true;
		videoElement.play();
		//videoElement.muted = false;
		const layer = imageRef.current.getLayer();
		const anim = new Animation(() => {}, layer);
		anim.start();
		return () => anim.stop();
	}

	useEffect(() => {
		videoElement.addEventListener("canplay", onCanPlay);
		return () => {
			videoElement.removeEventListener("canplay", onCanPlay);
		};
	}, [videoElement]);

	useEffect(() => {
		trRef.current.nodes([imageRef.current]);
		trRef.current.getLayer().batchDraw();
	}, [])

	return (<>
		<Image
			ref={imageRef}
			image={videoElement}
			stroke="black"
			width={curVideo.width}
			height={curVideo.height}
			draggable
		/>
		<Transformer
			ref={trRef}
			rotateAnchorOffset={60}
			enabledAnchors={[
				'top-left', 'top-right', 'bottom-left', 'bottom-right'
			]}
		/>
	</>);
});

const EditorCanvas = observer(function EditorCanvas({ className="", uiStore, domainStore }) {
	
	const windowWidth = uiStore.canvasSize.width;
	const windowHeight = uiStore.canvasSize.height;

	let projectWidth = domainStore.projectMetadata.width * uiStore.zoomPercentage / 100;
	let projectHeight = domainStore.projectMetadata.height * uiStore.zoomPercentage / 100;

	let relativeX = windowWidth / 2 - projectWidth / 2;
	let relativeY = windowHeight / 2 - projectHeight / 2;

	const onZoomChange = (event) => {
		uiStore.canvasControls.zoom = event.target.value;
		projectWidth = domainStore.projectMetadata.width * uiStore.zoomPercentage / 100;
		projectHeight = domainStore.projectMetadata.height * uiStore.zoomPercentage / 100;
		relativeX = windowWidth / 2 - projectWidth / 2;
		relativeY = windowHeight / 2 - projectHeight / 2;
	}

    return (<div className={className}>
		<div>
			<label htmlFor="project_zoom"> Zoom </label>
			<input 
				id="project_zoom"
				type={"range"}
				min={0}
				max={10}
				value={uiStore.canvasControls.zoom}
				onChange={onZoomChange}
			/>
		</div>
		<Stage 
			width={windowWidth}
			height={windowHeight}
		>
            <Layer>
                <Rect 
					className="fill-red"
					width={windowWidth}
					height={windowHeight}
					fill="red"
				/>
				<Rect
					x={relativeX}
					y={relativeY}
					width={projectWidth}
					height={projectHeight}
					fill="white"
				/>
				<DraggableVideo
					domainStore={domainStore}
				/>
            </Layer>
        </Stage>
	</div>
    );
});

export default EditorCanvas;
