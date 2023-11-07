import React from 'react';

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { action } from "mobx";
import BigPlusIcon from '../../icons/BigPlusIcon';

const NewTab = observer(function NewTab({
	collapsed = false,
}) {
	const { uiStore, domainStore } = useRootContext();

	const curTab = domainStore.tabs[domainStore.curTabPos];

	const onAddClick = action(() => {
		domainStore.addTab();
		uiStore.logData("tabAdd", {
			tabId: curTab.id,
		});
	});


	return (<div className="flex flex-row gap-2">
		<button 
			className="w-fit bg-green-600 hover:bg-green-700 text-white font-bold h-fit py-2 px-2 rounded mr-2"
			onClick={() => onAddClick()} 
		>
			<div className="flex flex-row justify-center items-center gap-1">
				<BigPlusIcon />
			</div>
		</button>
	</div>);
});

export default NewTab;