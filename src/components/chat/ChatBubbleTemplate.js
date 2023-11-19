import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck } from "@fortawesome/free-solid-svg-icons";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";

import SnapshotImg from "../../snapshot_example.png";

const ChatBubbleTemplate = ({ description, screenshot, explanation, index }) => {
    const [isChecked, setChecked] = useState(false);

    const toggleChecked = () => {
        setChecked(!isChecked);
    };

    return (
        <div className="mb-3">
            <div className="flex flex-row items-center">
                <button
                    className={`w-5 h-5 mr-2 rounded-full border border-black flex items-center justify-center focus:outline-none ${
                        isChecked ? "bg-black text-white" : ""
                    }`}
                    onClick={toggleChecked}
                >
                    {isChecked && <FontAwesomeIcon icon={faCheck} />}
                </button>
                <div className="font-semibold hover:cursor-pointer" onClick={toggleChecked}>
                    Edit #{index + 1}
                </div>
            </div>
            <div
                className={`mt-1 bg-slate-200 w-96 h-56 pl-5 pt-2 rounded-md hover:cursor-pointer ${
                    isChecked ? "border-2 border-black" : ""
                }`}
                onClick={toggleChecked}
            >
                <div className="mb-2">{description}</div>
                {/* TODO: update image */}
                <img src={SnapshotImg} alt="snapshot" width="280" />
            </div>
        </div>
    );
};

export default ChatBubbleTemplate;
