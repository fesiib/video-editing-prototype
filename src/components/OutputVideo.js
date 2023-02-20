import React from "react";

function OutputVideo(props) {
    const {
        handleDownload,
        videoSrc
    } = props;

    return videoSrc ? (
        <div>
            <article className="grid_txt_2">
                <div className="bord_g_2 p_2">
                    <video src={videoSrc} autoPlay controls muted width="400" />
                </div>
                <button onClick={handleDownload} className="btn btn_g">
                    {" "}
                    download
                </button>
            </article>
        </div>
    ) : null;
}

export default OutputVideo;