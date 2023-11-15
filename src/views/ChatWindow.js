import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, set, toJS } from "mobx";
import useRootContext from "../hooks/useRootContext";

const UserCommandBubble = observer(function UserCommandBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();

	return (<div>
		{bubble.time} {bubble.content}
	</div>);
});

const Bubble = observer(function Bubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();

	if (bubble.type === "userCommand") {
		return <UserCommandBubble bubble={bubble} />;
	}
	return null;
});

const ChatWindow = observer(function ChatWindow() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;

	const curTab = domainStore.tabs[domainStore.curTabPos];

	const timeSortedBubbles = [
		...curTab.systemBubbles, ...curTab.userBubbles
	].sort((a, b) => a.time - b.time);

	return (<div>
		{
			timeSortedBubbles.map((bubble, idx) => {
				return <Bubble bubble={bubble} key={idx} />
			})
		}
	</div>);
});

export default ChatWindow;