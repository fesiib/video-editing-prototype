import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";

import { AiOutlineBulb } from "react-icons/ai";

import useRootContext from "../../hooks/useRootContext";
import { toJS } from "mobx";

const RowsVisualization = observer(function RowsVisualization({
	contribution,
}) {
	const COMMAND = "command";
	const { userStore, uiStore, domainStore } = useRootContext();

	const curIntent = domainStore.intents[domainStore.curIntentPos];

	let rows = {
		[COMMAND]: [],
		"edit": [],
		"custom": [],
		"spatial": [],
		"temporal": [],
	};

	const DISPLAY_NAMES = {
		[COMMAND]: null,
		"temporal": "when (timeline)",
		"spatial": "where (frame)",
		"edit" : "what (edit)",
		"custom": "how (parameters)",
	};

	// let fullText = "";
	// for (let i = 0; i < contribution.length; i++) {
	// 	const single = contribution[i];
	// 	fullText += single.text;
	// 	const text = single.text;
	// 	const type = single.type;
	// 	for (let refType of type) {
	// 		const t = refType.startsWith("custom.") ? "custom" : refType;
	// 		if (!(t in rows)) {
	// 			rows[t] = [];
	// 		}
	// 		rows[t].push({
	// 			offset: fullText.length - text.length,
	// 			text: text,
	// 		});
	// 	}
	// }

	return (<div className="flex flex-col text-s p-2 bg-gray-100 overflow-x-auto">
		{
			Object.keys(rows).map((rowKey, idx) => {
				// const content = rows[rowKey];
				// if (content.length === 0 && rowKey !== COMMAND) {
				// 	return null;
				// }
				return (<div className="flex flex-row flex-nowrap w-fit gap-2 items-center"
					key={`contribution-${rowKey}`}
				>
					<div
						className="w-28 text-left text-xs"
					>
						{DISPLAY_NAMES[rowKey]}
					</div>
					<div
						className={"relative flex flex-row gap-1"}
					>
						<div 
							className={"absolute w-full"
								+ (rowKey === COMMAND ? "" : " bg-gray-300 rounded")
							}
							style={{
								height: `${50}%`,
								bottom: `${25}%`,
							}}
						> </div>
						{contribution.map((single, idx) => {
							const text = single.text;
							const type = single.type;
							const highlight = (type.includes(rowKey) || (
								rowKey === "custom" && type.some((t) => t.startsWith(`custom.${curIntent.editOperationKey}`))
							));
							console.log()
							// const isCustom = type.startsWith("custom.");
							// const t = rowKey.startsWith("custom.") ? "custom" : rowKey;
							if (rowKey === COMMAND) {
								return (<div
									className={"whitespace-nowrap"}
									key={`contribution-${rowKey}-${idx}`}
								>
									{text}
								</div>);
							}
							return (<div 
								className={"relative disable-select whitespace-nowrap "
									+ (highlight ? "" : "text-transparent")
								}
								key={`contribution-${rowKey}-${idx}`}
							> 
								{highlight ? (
									<div 
										className={"absolute w-full rounded bg-yellow-300 opacity-25"}
										style={{
											height: `${50}%`,
											bottom: `${25}%`,
											//backgroundColor: uiStore.referenceTypeColorPalette[rowKey],
											//backgroundColor: "yellow"
										}}
									>
									</div> ) : (null)
								}
								{text}
							</div>);
						})}
					</div>
				</div>);
			})
		}
	</div>);
});

const Explanation = observer(function Explanation() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;

	const curIntent = domainStore.intents[domainStore.curIntentPos];

	const selectedEdits = uiStore.timelineControls.selectedTimelineItems

	const selectedSuggestedEdits = selectedEdits.filter((item) => {
		return item.isSuggested;
	});

	// let textToExplain = "";
	// if (selectedSuggestedEdits.length === 1 && !domainStore.processingIntent && systemSetting) {
	// 	const edit = selectedSuggestedEdits[0];
	// 	const text = edit.contribution.map((single) => {
	// 		return single.text;
	// 	}).join("");
	// 	textToExplain = text.trim();
	// }

	return (
		curIntent.suggestedEdits.length === 0 || !systemSetting
	) ? (null) : (
		<div className="flex flex-col">
			<div className="flex gap-1 flex-row justify-start items-center">
				<AiOutlineBulb/>
				<span> Examine processing results: </span>
				{/* <span> {
					selectedSuggestedEdits.map((edit, idx) => {
						const isLast = idx === selectedSuggestedEdits.length - 1;
						let pos = 0;
						for (let sugestedEdit of curIntent.suggestedEdits) {
							if (sugestedEdit.commonState.offset <= edit.commonState.offset) {
								pos += 1;
							}
						}
						return pos + (isLast ? "" : ", ");
					})
				} / {curIntent.suggestedEdits.length} </span> */}
			</div>
			{/* Lines below */}
			<RowsVisualization 
				contribution={selectedSuggestedEdits.length > 0 ?
					selectedEdits[0].contribution :
					curIntent.combinedContribution
				}
			/>
			{/* 
			Colors on top of the text
			<div className="flex flex-row flex-wrap gap-1 text-xs p-2 bg-gray-100">
			{
				selectedEdits[0].contribution.map((single, idx) => {
					const text = single.text;
					const type = single.type.filter((ref) => {
						return !ref.startsWith("custom.") || ref === `custom.${curIntent.editOperationKey}`;
					});
					return (<div 
						className={"relative h-fit"}
						key={`contribution-${idx}-${text}`}
					> 
						{type.map((refType, t_idx) => {
							const t = refType.startsWith("custom.") ? "custom" : refType;
							const typeClassName = "absolute w-full ";
							return (<div 
								className={typeClassName}
								style={{
									height: `${(1 / type.length) * 100}%`,
									bottom: `${(t_idx / type.length) * 100}%`,
									backgroundColor: uiStore.referenceTypeColorPalette[t],
								}}
								key={`contribution-${idx}-${text}-${t}`}
							>
							</div>);
						})}
						{text}
					</div>);
				})
			}
			</div> */}
		</div>
	);
});

export default Explanation;