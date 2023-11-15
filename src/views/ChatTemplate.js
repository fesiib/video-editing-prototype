import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import ChatTabTemplate from "./ChatTabTemplate";

import useRootContext from "../hooks/useRootContext";

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

    return (
        <div className="w-100">
			<ChatTabTemplate />
            <div className="flex flex-start overflow-auto text-xs">
                {tabs.map((tab) => {
					const idx = tab.idx;
					return (<div
                        key={`tab-${idx}`}
                        className={`tab ${curTab.id === tab.id ? "active-tab" : ""} truncate`}
                        onClick={() => setCurTab(tab.idx)}
                    >
                        {tab.idx}: {tab.title}
                    </div>);
				})}
                <div className="add-tab" onClick={addTab}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
        </div>
    );
});

export default ChatTemplate;
