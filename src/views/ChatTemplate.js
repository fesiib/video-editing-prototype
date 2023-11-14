import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import ChatTabTemplate from "./ChatTabTemplate";

const ChatTemplate = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [tabs, setTabs] = useState([
        { label: "1", content: <ChatTabTemplate /> },
        { label: "2", content: <ChatTabTemplate /> },
        // Add more tabs as needed
    ]);

    const addTab = () => {
        const newTab = {
            label: `${tabs.length + 1}`,
            content: <ChatTabTemplate />,
        };
        setTabs([...tabs, newTab]);
        setActiveTab(tabs.length);
    };

    return (
        <div className="w-100">
            <div>{tabs[activeTab].content}</div>
            <div className="flex flex-start overflow-auto text-xs">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tab ${index === activeTab ? "active-tab" : ""}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab.label}
                    </div>
                ))}
                <div className="add-tab" onClick={addTab}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
        </div>
    );
};

export default ChatTemplate;
