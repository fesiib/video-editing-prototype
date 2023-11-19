import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import useRootContext from '../../hooks/useRootContext'
import { action } from 'mobx';

const ChatEditPreview = observer(function ChatEditPreview({ edit }) {
	const [showEdit, setShowEdit] = useState(false);

	const {userStore, uiStore, domainStore} = useRootContext();

	const curVideo = domainStore.curVideo;
	const curTab = domainStore.curTab;

	const maxWidth = uiStore.chatConst.editPreviewWidth;
	//const maxHeight = uiStore.chatConst.editPreviewHeight;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;


	const videoWidth = curVideo?.commonState?.width;
	const videoHeight = curVideo?.commonState?.height;
	const videoSource = curVideo?.source ? curVideo?.source : "";
	const videoId = curVideo?.commonState?.id ? curVideo?.commonState?.id : "";

	const previewWidth = videoWidth > maxWidth ? maxWidth : videoWidth;
	const previewHeight = previewWidth * videoHeight / videoWidth;

	const editX = edit.commonState.x / projectWidth * previewWidth;
	const editY = edit.commonState.y / projectHeight * previewHeight;
	const editWidth = edit.commonState.width / projectWidth * previewWidth;
	const editHeight = edit.commonState.height / projectHeight * previewHeight;

	const setupEditFrame = action((event) => {
		const timestamp = edit.commonState.offset;
		const video = event.target;
		video.currentTime = timestamp;
		video.pause();
		setShowEdit(true);
	});

	return (<div className='relative'>
		<video src={videoSource} height={previewHeight} width={previewWidth} muted={true} onCanPlay={setupEditFrame}/>
		{
			showEdit && curTab.editOperation !== null ? (
				<svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`} className='absolute top-0'>
					<rect x={editX} y={editY} width={editWidth} height={editHeight} fill="black" fillOpacity="0.5"/>
					<text x={editX + 1} y={editY + editHeight / 2} textLength={editWidth} fill="white" fontSize="20" fontFamily="Verdana"
					> {curTab.editOperation.title} </text>
				</svg>
			) : (
				null
			)
		}
	</div>);
});

export default ChatEditPreview;