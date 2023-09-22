import React, { useState } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import DeleteIcon from "../../icons/DeleteIcon";
import { action } from "mobx";


const EmptySpace = observer(function EmptySpace({space, scenes}) {
	const {uiStore} = useRootContext();

	const [isHoveredOver, setIsHoveredOver] = useState(false);

	const onMouseEnterEmptySpace = () => {
		setIsHoveredOver(() => true);
	};

	const onMouseLeaveEmptySpace = () => {
		setIsHoveredOver(() => false);
	};

	const onDblClickEmptySpace = action((event) => {
		for (let scene of scenes) {
			if (scene.commonState.offset > space.offset) {
				scene.commonState.setMetadata({
					offset: scene.commonState.offset - space.duration,
				})
			}
		}
	});

	const style = {
		transform: `translate3d(${uiStore.secToPx(space.offset)}px, ${0}px, ${0}px)`,
		width: uiStore.secToPx(space.duration),
		opacity: isHoveredOver ? 1 : 0,
	};

	if (space.duration === 0) {
		return null;
	}

	return (<div
		className={
			"flex justify-center absolute bottom-0 z-10 border-2 brightness-50"
		}
		style={style}
		onMouseEnter={onMouseEnterEmptySpace}
		onMouseLeave={onMouseLeaveEmptySpace}
		onDoubleClick={onDblClickEmptySpace}
	>
		<DeleteIcon />
	</div>);
});

export default EmptySpace;