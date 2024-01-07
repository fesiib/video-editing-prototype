import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";
import { action } from "mobx";

const NavigationToggle = observer(function NavigationToggle() {
	const { uiStore } = useRootContext();
	const isTimeline = uiStore.navigation === "timeline";

	const onToggleClick = action(() => {
		if (isTimeline) {
			uiStore.setNavigation("transcript");
		} else {
			uiStore.setNavigation("timeline");
		}
	});
	return (<button
		className="my-1 flex flex-row w-fit justify-start items-center"
		onClick={() => onToggleClick()}
	>
		<div className="flex flex-row border rounded">
			<span className={
				"px-1 hover:brightness-75" + (isTimeline ? " bg-indigo-300 text-black" : " text-gray-500")
			}> Edit Panel </span>
			<div
				id="separator"
				className="vert"
			></div>
			<span className={
				"px-1 hover:brightness-75" + (!isTimeline ? " bg-indigo-300 text-black" : " text-gray-500")
			}> Transcript </span>
		</div>
		{/* <span> Edit Panel </span>
		<div className={
			"flex flex-row w-10 h-5 border hover:brightness-75 rounded"
				+ (isTimeline ? " justify-start" : " justify-end")
		}>
			<div className={"bg-indigo-300 w-5 h-5 border hover:brightness-75 rounded"}> </div>
		</div>
		<span> Transcript </span> */}
	</button>);
});

export default NavigationToggle;