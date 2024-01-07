import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import useRootContext from '../../hooks/useRootContext'
import { action, toJS } from 'mobx';

function invertColor(hex) {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}
	if (hex.length !== 6) {
		return "black";
	}
	// invert color components
	const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
	const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
	const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
	// pad each with zeros and return
	const padZero = (str) => {
		const len = str.length;
		if (len === 1) {
			return '0' + str;
		}
		return str;
	};
	return '#' + padZero(r) + padZero(g) + padZero(b);
}

const EditSpecificPreview = observer(function EditSpecificPreview({
	edit,
	previewWidth,
	previewHeight,
}) {
	const {userStore, uiStore, domainStore} = useRootContext();
	const curTab = domainStore.curTab;

	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = edit.commonState.x / projectWidth * previewWidth;
	const y = edit.commonState.y / projectHeight * previewHeight;
	const width = edit.commonState.width / projectWidth * previewWidth;
	const height = edit.commonState.height / projectHeight * previewHeight;
	if (curTab.editOperation === null) {
		return null;
	}
	let backgroundAlpha = 0.5;
	let backgroundFill = "red";
	let fill = "white";
	let fontFamily = "Verdana";
	let content = curTab.editOperation.title;
	let fontSize = Math.min(20, height/2, width/(content.length + 1));
	if (curTab.editOperationKey === "text") {
		backgroundAlpha = edit.textParameters.background.alpha;
		backgroundFill = edit.textParameters.background.fill;
		fill = edit.textParameters.style.fill;
		if (edit.textParameters.content?.length > 0) {
			content = (edit.textParameters.content.substring(0, 10) 
				+ (edit.textParameters.content.length > 10 ? "..." : "")
			);
		}
	}
	else if (curTab.editOperationKey === "image") {
		backgroundFill = "gray";
		fill = "black";
		if (edit.imageParameters.searchQuery?.length > 0) {
			content = edit.imageParameters.searchQuery;
		}
		const source = edit.imageParameters.source;
		if (source?.length > 0) {
			return (<svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`} className='absolute top-0'>
				<image x={x} y={y} width={width} height={height} href={source} preserveAspectRatio='none' />
			</svg>);
		}
	}
	else if (curTab.editOperationKey === "shape") {
		backgroundAlpha = edit.shapeParameters.background.alpha;
		backgroundFill = edit.shapeParameters.background.fill;
		// inverted backgroundFill
		fill = invertColor(backgroundFill);
		content = edit.shapeParameters.type;
	}
	else if (curTab.editOperationKey === "cut") {
		backgroundFill = "black";
		fill = "white";
		fontSize = 20;
		return (<svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`} className='absolute top-0'>
			<rect x={0} y={0} width={previewWidth} height={previewHeight} fill={backgroundFill} fillOpacity="0.5" />
			<text x={previewWidth/2} y={previewHeight/2} fill={fill} 
				fontSize={fontSize}
				fontFamily={fontFamily}
				textAnchor='middle'
				dominantBaseline='middle'
			> {content} </text>
		</svg>);
	}
	else if (curTab.editOperationKey === "crop") {
		backgroundFill = "red";
		fill = "white";
	}
	else if (curTab.editOperationKey === "zoom") {
		backgroundFill = "red";
		fill = "white";
		content = `Zoom: ${edit.zoomParameters.zoomDurationStart}, ${edit.zoomParameters.zoomDurationEnd}\n`;
	}
	else if (curTab.editOperationKey === "blur") {
		fill = "white"
		content = `blur: ${edit.blurParameters.blur}`;
		fontSize = 20;
		return (<svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`} className='absolute top-0'>
			<defs>
				<filter id="f1" x="0" y="0">
					<feGaussianBlur in="SourceGraphic" stdDeviation={edit.blurParameters.blur} />
				</filter>
			</defs>
			<rect x={0} y={0} width={previewWidth} height={previewHeight} fillOpacity={0.5} filter="url(#f1)" />
			<text x={previewWidth/2} y={previewHeight/2} fill={fill} 
				fontSize={fontSize}
				fontFamily={fontFamily}
				textAnchor='middle'
				dominantBaseline='middle'
			> {content} </text>
		</svg>);
	}
	return (<svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`} className='absolute top-0'>
		<rect x={x} y={y} width={width} height={height} fill={backgroundFill} fillOpacity={backgroundAlpha}/>
		<text x={x + width/2} y={y + height/2} fill={fill} 
			fontSize={fontSize}
			fontFamily={fontFamily}
			textAnchor='middle'
			dominantBaseline='middle'
		> {content} </text>
	</svg>);	
});

const ChatEditPreview = observer(function ChatEditPreview({ edit }) {
	const [showEdit, setShowEdit] = useState(true);

	const {userStore, uiStore, domainStore} = useRootContext();

	const curVideo = domainStore.curVideo;
	const curTab = domainStore.curTab;

	const maxWidth = uiStore.chatConst.editPreviewWidth;
	//const maxHeight = uiStore.chatConst.editPreviewHeight;

	// const videoWidth = curVideo?.commonState?.width;
	// const videoHeight = curVideo?.commonState?.height;
	// const videoSource = curVideo?.source ? curVideo?.source : "";
	// const videoId = curVideo?.commonState?.id ? curVideo?.commonState?.id : "";

	const projectWidth = domainStore.projectMetadata.width;
	const projectHeight = domainStore.projectMetadata.height;

	const previewWidth = projectWidth > maxWidth ? maxWidth : projectWidth;
	const previewHeight = previewWidth * projectHeight / projectWidth;

	const editTimestamp = edit.commonState.offset;
	const videoFrameLink = curVideo.frameLink(editTimestamp);

	const setupEditFrame = action((event) => {
		const timestamp = edit.commonState.offset;
		const video = event.target;
		video.currentTime = timestamp;
		video.pause();
		setShowEdit(true);
	});


	// TODO: Simulate each edit type
	// CUT -> show dark overlay
	return (<div className='relative'>
		<img src={videoFrameLink} height={previewHeight} width={previewWidth} />
		{/* <video src={videoSource} height={previewHeight} width={previewWidth} muted={true} onCanPlay={setupEditFrame}/> */}
		{
			showEdit && <EditSpecificPreview
				edit={edit}
				editOperation={curTab.editOperation}
				previewWidth={previewWidth}
				previewHeight={previewHeight}
			/>
		}
	</div>);
});

export default ChatEditPreview;