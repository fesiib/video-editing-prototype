import React from "react"

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import { playPositionToFormat } from "../utilities/timelineUtilities";


function SentenceBox ({ item }) {
	const { uiStore } = useRootContext();

	const colorPalette = uiStore.labelColorPalette;

    return (
        <div className="grid grid-cols-8 gap-3 border-dashed border">
			<div className="col-span-1 my-auto text-left">
				{playPositionToFormat(item.start)}
			</div>
			<div className="col-span-2 my-auto text-left">
				{item.highLabel}
			</div>
            <div className="flex col-span-2">
                <div className="w-32 m-auto text-center"
					style={{backgroundColor: colorPalette[item.lowLabel] }}
				>
                   {item.lowLabel}
                   {/* <span className="tooltiptext">{item.lowLabel}<br/>{"definition"}</span> */}
                </div>
            </div>
            <div className="col-span-3 text-left">{item.text}</div>
        </div>
    )
}

const Script = observer(function Script(){
	const { uiStore, domainStore } = useRootContext();

	const filteredScript = domainStore.scripts;

    const handleSentenceClick = action((index) => {
        uiStore.timelineControls.playPosition = filteredScript[index].start;
    });

	const largerIndex = filteredScript.findIndex((item, index) => {
		if (item.start > uiStore.timelineControls.playPosition) {
			return true;
		}
		return false;
	});
		
	const selectedIndex = largerIndex === -1 ? filteredScript.length - 1 : largerIndex - 1;

    return(
        <div className="bg-slate-100">
            {filteredScript.length === 0 ?
				<div className="text-red"> No Script... </div> :
				<div className="overflow-auto">
					{filteredScript &&
						filteredScript.map ((item, index) => (
						<div 
							key={index}
							id={"script" + index}
							className={selectedIndex === index ? "bg-red-400" : "bg-slate-300"}
							onClick={() => handleSentenceClick(index)}
						>
							<SentenceBox 
								item={item}
							/>
						</div>))
					}
				</div>
            }
        </div>
    )
});

export default Script;