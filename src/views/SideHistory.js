import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import CollapseIcon from "../icons/CollapseIcon";
import UncollapseIcon from "../icons/UncollapseIcon";
import NewIntent from "../components/general/NewIntent";
import TrashcanIcon from "../icons/TrashcanIcon";
import CopyIcon from "../icons/CopyIcon";


const SideHistory = observer(function SideHistory() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const reversedIntents = [...domainStore.intents].reverse();

	const [collapsed, setCollapsed] = useState(true);

	const onDeleteClick = action((intentPos) => {
		domainStore.deleteIntent(intentPos);
	});

	const onCopyClick = action((intentPos) => {
		domainStore.copyIntentToCurrent(intentPos);
	});

	const onIntentClick = action((intentPos) => {
		domainStore.setCurIntent(intentPos);
	});

	return (<div 
		className={"absolute overflow-y-scroll bg-gray-100 divide-y divide-gray-400 h-full z-30"
			+ (collapsed ? " w-full" : " w-64")
		}
		onMouseEnter={() => setCollapsed(false)}
		onMouseLeave={() => setCollapsed(true)}
	>
		<div className="p-1">
			Edit List
		</div>
		<div className="p-1">
			<NewIntent collapsed={collapsed} />
		</div>
		{reversedIntents.length === 0 ? (
			<div> No edits </div>
			) : (
			reversedIntents.map((intent, revIdx) => {
				const idx = reversedIntents.length - revIdx - 1;
				const titleIdx = intent.idx;
				const title = intent.editOperation === null ? "None" : intent.editOperation.title;
				return <div  key={"intent" + idx} className={"px-1 py-1 flex justify-between gap-2"
					+ (curIntent.idx === titleIdx ? " bg-gray-400 " : " bg-gray-100 hover:bg-gray-400 ")
				}>
					<button
						className={"text-left truncate text-black font-bold py-2 px-2 rounded"
						}
						disabled={curIntent.idx === titleIdx}
						onClick={() => onIntentClick(idx)}
					>
						{/* {titleIdx} - {`[${title}]`}: {intent.summary} */}
						{titleIdx}: {intent.summary}
					</button>
					{
						collapsed ? null : (
						<div className="w-fit flex gap-2 justify-center">
							{curIntent.idx === titleIdx ? null
							: (<button
								className="w-fit text-left bg-indigo-300 hover:bg-indigo-400 text-white py-2 px-2 rounded"
								onClick={() => onCopyClick(idx)}
								// TODO: copy confirm
							> 
								<CopyIcon />
							</button>)}
							<button 
								className="w-fit bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-2 px-2 rounded"
								onClick={() => onDeleteClick(idx)}
								// disabled={curIntent.activeEdits.length === 0}
								// TODO: confirm delete
							> 	
								<TrashcanIcon />
							</button>
						</div>)
					}
				</div>
			}))
		}
	</div>);
});

export default SideHistory;