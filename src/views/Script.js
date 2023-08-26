import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import { playPositionToFormat } from "../utilities/timelineUtilities";

const SentenceBox = observer(function SentenceBox({ 
	item,
	showHighLabel ,
	onTimestampClick,
	onScriptMouseDown,
	onScriptMouseUp,
	onScriptMouseOver,
}) {
    const { uiStore } = useRootContext();

    const colorPalette = uiStore.labelColorPalette;

    return (
        <div 
			// className={"grid grid-cols-8 gap-3 border-dashed border border-red-500"}
			className={"grid grid-cols-8"}
		>
            <div className="col-span-1 my-auto text-left text-sky-600 hover:text-blue-800 underline decoration-sky-600 hover:decoration-blue-800"
				onClick={onTimestampClick}
			>{playPositionToFormat(item.start)}</div>
            {/* <div className="col-span-2 my-auto text-left bg-black text-white">
                {showHighLabel ? item.highLabel : ""}
            </div> */}
            {/*
			<div className="flex col-span-2">
                <div
                    className="w-32 m-auto text-center"
                    style={{ backgroundColor: colorPalette[item.lowLabel] }}
                >
                    {item.lowLabel}
                    {/* <span className="tooltiptext">{item.lowLabel}<br/>{"definition"}</span>
                </div> 
            </div>  */}

            <div className="col-span-7 text-left border-dashed border-b-2 border-red-500"
				onMouseDown={onScriptMouseDown}
				onMouseUp={onScriptMouseUp}
				onMouseOver={onScriptMouseOver}
			>{item.text}</div>
        </div>
    );
});

const Script = observer(function Script() {
    const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
    const filteredScript = domainStore.transcripts;
	const selectedIndex = domainStore.transcriptSelectedIndex;

	const [intentSelector, setIntentSelector] = useState({
		start: -1,
		select: false,
	});

    const handleSentenceClick = action((index) => {
        uiStore.timelineControls.playPosition = filteredScript[index].start;
    });

	const handleSentenceMouseDown = action((event, index) => {
		event.preventDefault();
		const transcriptIndex = curIntent.selectedTranscriptIndex(filteredScript[index])
		setIntentSelector({
			start: index,
			select: (transcriptIndex === -1 ? true : false),
		});
		const single = filteredScript[index];
		if (transcriptIndex === -1) {
			curIntent.selectPeriod(
				single.video, 
				single.start,
				single.finish
			);
		}
		else {
			curIntent.deselectPeriod(
				single.video, 
				single.start,
				single.finish
			);
		}
	});

	const handleSentenceMouseOver = action((event, index) => {
		event.preventDefault();
		const start = intentSelector.start;
		if (start >= 0) {
			const transcriptIndex = curIntent.selectedTranscriptIndex(filteredScript[index])
			const single = filteredScript[index];
			if (transcriptIndex === -1 && intentSelector.select === true) {
				curIntent.selectPeriod(
					single.video, 
					single.start,
					single.finish
				);
			}
			if (transcriptIndex > -1 && intentSelector.select === false) {
				curIntent.deselectPeriod(
					single.video, 
					single.start,
					single.finish
				);
			}
		}
	});

	const handleSentenceMouseUp = action((event, index) => {
		event.preventDefault();
		const start = intentSelector.start;
		if (start >= 0) {
			// const left = Math.min(index, start);
			// const right = Math.max(index, start);
			// for (let idx = left; idx <= right; idx++) {
			// 	const single = filteredScript[idx];
			// 	if (intentSelector.select === true) {
			// 		curIntent.selectPeriod(
			// 			single.video, 
			// 			single.start,
			// 			single.finish
			// 		);
			// 	}
			// 	else {
			// 		curIntent.deselectPeriod(
			// 			single.video, 
			// 			single.start,
			// 			single.finish
			// 		);
			// 	}
			// }
			setIntentSelector({
				start: -1,
				select: false,
			});
		}
	});

    return (
        <div 
			className="bg-slate-100 overflow-scroll disable-select"
			style={{
				//width: uiStore.canvasSize.width,
                height: uiStore.windowSize.height / 3 * 2
			}}
		>
            {filteredScript.length === 0 ? (
                <div className="text-red"> No Script... </div>
            ) : (
                <div className="overflow-auto">
                    {filteredScript.map((item, index) => {
                        let showHighLabel = true;
                        if (
                            index > 0 &&
                            filteredScript[index - 1].finish === item.start &&
                            filteredScript[index - 1].highLabel === item.highLabel
                        ) {
                            showHighLabel = false;
                        }
						const isSelected = selectedIndex === index;
						const isIntentSelected = curIntent.selectedTranscriptIndex(filteredScript[index]) !== -1;
                        return (
                            <div
                                key={"script" + index}
                                id={"script" + index}
                                className={isSelected ? "bg-red-400" : (
									isIntentSelected ? "bg-yellow-300" : "bg-slate-300"
								)}
                            >
                                <div className={showHighLabel ? "border-t-2 border-black" : ""}
								>
                                    <SentenceBox 
										showHighLabel={showHighLabel}
										item={item} 
										onTimestampClick={() => handleSentenceClick(index)}
										onScriptMouseDown={(event) => handleSentenceMouseDown(event, index)}
										onScriptMouseUp={(event) => handleSentenceMouseUp(event, index)}
										onScriptMouseOver={(event) => handleSentenceMouseOver(event, index)}
									/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});


export default Script;