import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPlus } from "@fortawesome/free-solid-svg-icons";

import ChatTabTemplate from "../components/chat/ChatTabTemplate";
import ChatTab from "../components/chat/ChatTab";

import useRootContext from "../hooks/useRootContext";
import { TbBucket } from "react-icons/tb";

const ChatTemplate = observer(function ChatTemplate() {
	const { userStore, uiStore, domainStore } = useRootContext();

	const curTab = domainStore.curTab;
	const tabs = domainStore.tabs;

    const addTab = action(() => {
		domainStore.addTab();
    });

	const setCurTab = action((tabIdx) => {
		domainStore.setCurTab(tabIdx);
	});

	const deleteTab = action((tabIdx) => {
		// ask for confirmation
		if (curTab.timeOrderedBubbles.length > 0 && !window.confirm("Are you sure you want to delete this tab?")) {
			return;
		}
		domainStore.deleteTab(tabIdx);
	});

	//TODO: handle keydown
	const handleKeyDown = action((event) => {
		// Cmd + T -> add tab
		if (event.metaKey && event.key === "t") {
			addTab();
		}
		// Cmd + W -> close tab
		else if (event.metaKey && event.key === "w") {
			deleteTab(curTab.idx);
		}
	});

    return (
        <div className="w-100">
			{/* <ChatTabTemplate /> */}
            <div className="w-100 flex flex-start flex-wrap text-xs my-2">
                {tabs.map((tab, idx) => {
					return (<div
						key={tab.id}
						onClick={action(() => setCurTab(idx))}
						className={
							`tab ${curTab.id === tab.id ? "active-tab" : ""} ` + 
							"flex flex-row items-center justify-between gap-1"
						}
					>
						<span
							className="truncate"
						> 
							{tab.idx}: {tab.title}
						</span> 
						<div className="h-full hover:bg-gray-300 flex items-center" onClick={action(() => deleteTab(idx))}>
							<FontAwesomeIcon icon={faClose} />
						</div>
                    </div>);
				})}
                <div className="add-tab" onClick={addTab}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
			<ChatTab />
        </div>
    );
});

export default ChatTemplate;
