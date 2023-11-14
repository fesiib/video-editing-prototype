import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";

import ChatBubbleTemplate from "./ChatBubbleTemplate";

const ChatTabTemplate = (props) => {
    const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
    const [editSuggestions, setEditSuggestions] = useState([
        {
            description: "Put a text 'Pasta!' from 2:03 to 2:13",
            img: "",
            explanation: "...This is a pasta...",
        },
        {
            description: "Put a text 'Pasta!' from 2:03 to 2:13",
            img: "",
            explanation: "...This is a pasta...",
        },
        {
            description: "Put a text 'Pasta!' from 2:03 to 2:13",
            img: "",
            explanation: "...This is a pasta...",
        },
    ]);

    const toggleSelectAllChecked = () => {
        setIsSelectAllChecked(!isSelectAllChecked);
    };

    return (
        <div>
            <div>✨ Describe edits you want to implement!</div>
            <div className="flex items-center mt-2">
                <textarea
                    // id="textCommand"
                    className="rounded-md border-black border w-full p-2"
                    style={{
                        // margin: 0,
                        backgroundColor: "transparent",
                        borderWidth: "1.5px",
                        height: "45px",
                    }}
                />
                <button>
                    <FontAwesomeIcon
                        icon={faCamera}
                        className="mx-3"
                        style={{ fontSize: "20px" }}
                    />
                </button>
                <button className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded">
                    Enter
                </button>
            </div>
            <div className="overflow-auto mt-3" style={{ maxHeight: "720px" }}>
                {/* Explanation */}
                <div className="mb-3">
                    <div className="flex flex-row items-center">
                        <div className="font-semibold">Processing the Command...</div>
                    </div>
                    <div className="bg-slate-200 w-auto px-2 py-1 mr-10 mt-1 rounded-md">
                        <div className="italic">
                            "
                            <span className="bg-red-100">
                                Whenever the person engages with the screen
                            </span>
                            , draw a <span className="bg-green-100">sparkling mark</span>"
                        </div>
                    </div>
                </div>

                <div className="mb-3 flex flex-row items-center">
                    <div className="font-semibold mr-2">Suggested Edits</div>({"  "}
                    <button
                        className={`w-4 h-4 mr-1 border border-black flex items-center justify-center focus:outline-none ${
                            isSelectAllChecked ? "bg-black text-white" : ""
                        }`}
                        onClick={toggleSelectAllChecked}
                    >
                        {isSelectAllChecked && <FontAwesomeIcon icon={faCheck} />}
                    </button>
                    {!isSelectAllChecked ? "Select All" : "Deselect All"})
                </div>

                {/* Edit suggestions */}
                {editSuggestions.map((suggestion, index) => (
                    <ChatBubbleTemplate
                        index={index}
                        description={suggestion.description}
                        screenshot={suggestion.screenshot}
                        explanation={suggestion.explanation}
                    />
                ))}

                {/* Generating one */}
                <div className="flex flex-row items-center mb-3 font-semibold">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className="mr-2"
                        style={{ fontSize: "22px" }}
                    />{" "}
                    Generating...
                </div>

                {/* Summary */}
                <div className="mb-3">
                    <div className="flex flex-row items-center">
                        <div className="font-semibold">Summary of Edits</div>
                    </div>
                    <div className="bg-slate-200 w-auto px-2 py-1 mr-10 mt-1 rounded-md">
                        We put a mark on ...
                    </div>
                </div>
            </div>
            <div className="flex items-center mt-3">
                <button className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-3 mr-1 rounded-md w-1/2">
                    {" "}
                    Cancel{" "}
                </button>
                <button className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-3 ml-1 rounded-md w-1/2">
                    {" "}
                    Edit Command{" "}
                </button>
            </div>
        </div>
    );
};

export default ChatTabTemplate;
