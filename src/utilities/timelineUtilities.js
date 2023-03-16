export function playPositionToFormat(seconds) {
    const date = new Date();
    date.setTime(seconds * 1000);
    return (
        date.toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        }) +
        (date.getMilliseconds() !== 0
            ? ":" + (date.getMilliseconds() + 1000).toString().slice(1)
            : "")
    );
}

export function timlineItemMiddle(scene, transform, uiStore) {
	let newOffset = scene.commonState.offset + ( typeof transform?.x === 'number' ?
		uiStore.pxToSec(transform.x) :
		0
	);
	return newOffset + scene.commonState.sceneDuration / 2;
}

export function preventCollision(scene, scenes, transform, uiStore) {
	const curOffset = scene.commonState.offset + ( typeof transform?.x === 'number' ?
		uiStore.pxToSec(transform.x) :
		0
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
		// else if (otherMiddle > middle && otherOffset < curOffset + scene.commonState.sceneDuration) {
		// 	candidateOffset = otherOffset - scene.commonState.sceneDuration;
		// }
		if (candidateOffset > newOffset) {
			newOffset = candidateOffset;
		}
	}
	return newOffset;
}