import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import CollapseIcon from "../icons/CollapseIcon";
import UncollapseIcon from "../icons/UncollapseIcon";


const History = observer(function History() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const reversedIntents = [...domainStore.intents].reverse();

	const [collapsed, setCollapsed] = useState(false);

	const onDeleteClick = action((intentPos) => {
		domainStore.deleteIntent(intentPos);
	});

	const onCopyClick = action((intentPos) => {
		domainStore.copyIntentToCurrent(intentPos);
	});

	const onIntentClick = action((intentPos) => {
		domainStore.setCurIntent(intentPos);
	});

	const onTitleClick = () => {
		setCollapsed(() => !collapsed);
	}

	useEffect(() => {
		if (uiStore.canvasControls.sketching) {
			setCollapsed(true);
		} else {
			setCollapsed(false);
		}
	}, [uiStore.canvasControls.sketching, domainStore.curIntentPos]);

	return (<div className="max-h-fit">
		<button className="flex flex-row justify-start w-full bg-gray-200 hover:bg-gray-300" onClick={onTitleClick}>
			{collapsed ? <CollapseIcon /> : <UncollapseIcon />}
			<span> History </span>
		</button>
		{
			collapsed ? null : (
				<div className="border p-2 overflow-y-scroll bg-gray-100 max-h-60">
					{reversedIntents.length === 0 ? (
						<div> No edits </div>
						) : (
						reversedIntents.map((intent, revIdx) => {
							const idx = reversedIntents.length - revIdx - 1;
							const titleIdx = intent.idx;
							const title = intent.editOperation === null ? "None" : intent.editOperation.title;
							return <div  key={"intent" + idx} className="my-2 flex justify-between gap-2">
								<button
									className={(curIntent.idx === titleIdx ? "bg-indigo-500 " : "bg-indigo-300  hover:bg-indigo-400 ")
										+ "text-left text-black font-bold py-2 px-4 rounded"
									}
									disabled={curIntent.idx === titleIdx}
									onClick={() => onIntentClick(idx)}
								>
									{titleIdx} - {`[${title}]`}: {intent.summary}
								</button>
								<div className="w-fit flex gap-2 justify-center p-2">
									{curIntent.idx === titleIdx ? null
									: (<button
										className="w-fit text-left bg-indigo-300 hover:bg-indigo-400 text-black py-2 px-4 rounded"
										onClick={() => onCopyClick(idx)}
										// TODO: copy confirm
									> Copy </button>)}
									<button 
										className="w-fit bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
										onClick={() => onDeleteClick(idx)}
										// disabled={curIntent.activeEdits.length === 0}
										// TODO: confirm delete
									> Delete </button>
								</div>
							</div>
						}))
					}
				</div>
			)
		}
	</div>);
});

export default History;