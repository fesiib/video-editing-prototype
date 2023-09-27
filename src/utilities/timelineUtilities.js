export function playPositionToFormat(seconds) {
    const date = new Date();
    date.setTime(seconds * 1000);
    return (
        date.toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        }) +
        ":" +
        (date.getMilliseconds() + 1000).toString().slice(1, 3)
    );
}

export function secondsToFormat(seconds) {
	const hh = Math.floor(seconds / 3600);
	const mm = Math.floor(seconds / 60) % 60;
	const ss = (seconds % 60).toFixed(1);
	return {
		hh, mm, ss
	};

	const date = new Date();
	date.setTime(seconds * 1000);
	return {
		hh: date.getUTCHours(),
		mm: date.getUTCMinutes(),
		ss: date.getUTCSeconds(),
		ms: date.getUTCMilliseconds() / 10,
	};
}

export function zeroPad(num, places) {
	return String(num).padStart(places, "0");
}

export function preventCollisionDrag(scene, scenes, transform, uiStore) {
    const transformSeconds = typeof transform?.x === "number" ? uiStore.pxToSec(transform.x) : 0;
    const curOffset = Math.min(
        uiStore.timelineConst.trackMaxDuration - scene.commonState.sceneDuration,
        Math.max(0, scene.commonState.offset + transformSeconds)
    );

    const middle = curOffset + scene.commonState.sceneDuration / 2;

    let newOffset = curOffset;

    for (let otherScene of scenes) {
        if (otherScene.commonState.id === scene.commonState.id) {
            continue;
        }
        const otherOffset = otherScene.commonState.offset;
        const otherEnd = otherScene.commonState.end;
        const otherMiddle = (otherEnd + otherOffset) / 2;
        let candidateOffset = newOffset;
        if (otherMiddle <= middle) {
            candidateOffset = otherEnd;
        }
        if (candidateOffset > newOffset) {
            newOffset = candidateOffset;
        }
    }

    let moveOffset = 0;
    for (let otherScene of scenes) {
        if (otherScene.commonState.id === scene.commonState.id) {
            continue;
        }
        const otherOffset = otherScene.commonState.offset;
        const otherEnd = otherScene.commonState.end;
        const otherMiddle = (otherEnd + otherOffset) / 2;

        if (otherMiddle > middle) {
            if (newOffset + scene.commonState.sceneDuration > otherOffset) {
                moveOffset = Math.max(
                    moveOffset,
                    newOffset + scene.commonState.sceneDuration - otherOffset
                );
            }
        }
    }

    return {
        newOffset,
        moveOffset,
        middle,
    };
}

export function preventCollisionDragMultiple(scene, scenes, transform, uiStore) {
    const selectedScenes = uiStore.timelineControls.selectedTimelineItems;
    if (selectedScenes.length === 0) {
        throw Error("no scenes were selected");
    }

    let leftMostScene = selectedScenes[0];
    let rightMostScene = selectedScenes[0];
    for (let someScene of selectedScenes) {
        if (leftMostScene.commonState.offset > someScene.commonState.offset) {
            leftMostScene = someScene;
        }
        if (rightMostScene.commonState.end < someScene.commonState.end) {
            rightMostScene = someScene;
        }
    }

    let transformSeconds = typeof transform?.x === "number" ? uiStore.pxToSec(transform.x) : 0;
    const selectedScenesDuration =
        rightMostScene.commonState.end - leftMostScene.commonState.offset;

    const curOffset = Math.min(
        uiStore.timelineConst.trackMaxDuration - selectedScenesDuration,
        Math.max(0, leftMostScene.commonState.offset + transformSeconds)
    );

    transformSeconds = curOffset - leftMostScene.commonState.offset;

    const middle =
        scene.commonState.offset + transformSeconds + scene.commonState.sceneDuration / 2;

	let maxOffset = 0;
	let minEnd = uiStore.timelineConst.trackMaxDuration;
    // let newOffset = curOffset;
	// let newEnd = curOffset + selectedScenesDuration;

    for (let otherScene of scenes) {
        const isSelected =
            selectedScenes.findIndex(
                (value) => value.commonState.id === otherScene.commonState.id
            ) >= 0;
        if (isSelected) {
            continue;
        }
        const otherOffset = otherScene.commonState.offset;
        const otherEnd = otherScene.commonState.end;
        const otherMiddle = (otherEnd + otherOffset) / 2;
		
		if (otherMiddle <= middle) {
			maxOffset = Math.max(otherEnd, maxOffset);
		}
		if (otherMiddle >= middle) {
			minEnd = Math.min(minEnd, otherOffset);
		}
		// // move the scenes on the right with the scenes that are being dragged
		// if (otherMiddle <= middle) {
        //     candidateOffset = otherEnd;
        // }
        // if (candidateOffset > newOffset) {
        //     newOffset = candidateOffset;
        // }
		// if (candidateEnd < newEnd) {
		// 	newEnd = candidateEnd;
		// }
    }

	let newOffset = curOffset;
	if (minEnd - selectedScenesDuration <= curOffset) {
		newOffset = minEnd - selectedScenesDuration;
	}
	if (maxOffset >= newOffset) {
		newOffset = maxOffset;
	}

    let moveOffset = 0;
    for (let otherScene of scenes) {
        const isSelected =
            selectedScenes.findIndex(
                (value) => value.commonState.id === otherScene.commonState.id
            ) >= 0;
        if (isSelected) {
            continue;
        }
        const otherOffset = otherScene.commonState.offset;
        const otherEnd = otherScene.commonState.end;
        const otherMiddle = (otherEnd + otherOffset) / 2;

        if (otherMiddle > middle) {
            if (newOffset + selectedScenesDuration > otherOffset) {
                moveOffset = Math.max(moveOffset, newOffset + selectedScenesDuration - otherOffset);
            }
        }
    }

    return {
        leftMostScene,
        newOffset,
        moveOffset,
        middle,
    };
}
