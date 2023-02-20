import React from "react";

function VideoFilePicker(props) {
    const {
        showVideo,
        handleChange,
        children
    } = props;

    const FileInput = () => {
        return (<div>
            <label
                htmlFor="fileInput"
                id={`${showVideo ? "file_picker_small" : ""}`}
                className={`file_picker`}
    
            >
                <span> choose file </span>
                <input 
                    onChange={handleChange}
                    id="fileInput"
                    type="file"
                    accept="video/mp4"
                />
            </label>
        </div>);
    }

    return showVideo ? (<>
        {" "}
        {children}
        <FileInput />
    </>) : (
        <FileInput />
    )
}

export default VideoFilePicker;