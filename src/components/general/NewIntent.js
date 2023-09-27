import React from 'react';

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { action } from "mobx";
import BigPlusIcon from '../../icons/BigPlusIcon';

const NewIntent = observer(function NewIntent({
	collapsed = false,
}) {
	const { uiStore, domainStore } = useRootContext();

	const curIntent = domainStore.intents[domainStore.curIntentPos];

	const onAddClick = action(() => {
		domainStore.addIntent();
		uiStore.logData("intentAdd", {
			intentId: curIntent.id,
		});
	});

	const onAddRandomClick = action(() => {
		domainStore.addRandomIntent();
	});


	return (<div className="flex flex-row gap-2">
		<button 
			className="w-fit bg-green-600 hover:bg-green-700 text-white font-bold h-fit py-2 px-2 rounded mr-2"
			onClick={() => onAddClick()} 
			// disabled={curIntent.activeEdits.length === 0}
		>
			<div className="flex flex-row justify-center items-center gap-1">
				<BigPlusIcon />
				<span> Add </span>
			</div>
		</button>
		{/* {collapsed ? null : (
			<button
				className="w-fit bg-green-500 hover:bg-green-700 text-white font-bold h-fit py-2 px-2 rounded"
				onClick={() => onAddRandomClick(curIntent.idx)}
				// disabled={curIntent.activeEdits.length === 0}
			>
				Random
			</button>
		)} */}
	</div>);
});

export default NewIntent;