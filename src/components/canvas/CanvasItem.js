import { observer } from "mobx-react-lite";
import React from "react";
import useRootContext from "../../hooks/useRootContext";
import DraggableText from "./DraggableText";
import DraggableVideo from "./DraggableVideo";

const CanvasItem = observer(function CanvasItem({ item, type }) {
    const { uiStore } = useRootContext();

    const left = item.commonState.offset;
    const right = item.commonState.end;
    const playPosition = uiStore.timelineControls.playPosition;
    const isVisible = left <= playPosition && right >= playPosition;

    return (
        <div className={!isVisible ? "invisible" : ""}>
            {type === "video" ? (
                <DraggableVideo curVideo={item} />
            ) : type === "text" ? (
                <DraggableText curText={item} />
            ) : null}
        </div>
    );
});

export default CanvasItem;
