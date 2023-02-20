import { format } from "date-fns";
import React, { useState } from "react";
import TimeRange from 'react-video-timelines-slider';

function EditTimeline(props) {

    const [selectedInterval, setSelectedInterval] = useState([1, 2]);
    const [error, setError] = useState(false);

    const defaultUpdateHandler = ({ error }) => {
        setError(error);
    };

    const defaultChangeHandler = (newSelectedInterval) => {
        setSelectedInterval(newSelectedInterval);
    };

    const {
        ticksNumber = 20,
        step = 1,
        timelineInterval = [0, 1000000],
        onUpdateCallback = defaultUpdateHandler,
        onChangeCallback = defaultChangeHandler,
        disabledIntervals = [],
        formatTick = (ms) => format(new Date(ms), 'HH:mm:ss'),
        formatTooltip = (ms) => format(new Date(ms), 'HH:mm:ss'),
        showTooltip = true,
        showTimelineError = false,
    } = props;
    
    return (<div className={"edit_timeline"}>
        <TimeRange
            error={error}
            ticksNumber={ticksNumber}
            step={step}
            selectedInterval={selectedInterval}
            timelineInterval={timelineInterval}
            onUpdateCallback={onUpdateCallback}
            onChangeCallback={onChangeCallback}
            disabledIntervals={disabledIntervals}
            formatTick={formatTick}
            formatTooltip={formatTooltip}
            showTooltip={showTooltip}
            showTimelineError={showTimelineError}
        />    
    </div>);
}

export default EditTimeline;