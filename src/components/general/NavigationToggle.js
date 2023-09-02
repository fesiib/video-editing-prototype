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
		className="px-2 flex flex-row w-fit gap-2 justify-start items-center"
		onClick={() => onToggleClick()}
	>
		<div className={
			"flex flex-row w-10 h-5 border hover:brightness-75 rounded"
				+ (isTimeline ? " justify-start" : " justify-end")
		}>
			<div className={"bg-indigo-300 w-5 h-5 border hover:brightness-75 rounded"}> </div>
		</div>
		<span> {uiStore.navigation.toUpperCase()} </span>
	</button>);
});

export default NavigationToggle;