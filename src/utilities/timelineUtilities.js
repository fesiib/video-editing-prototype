export function playPositionToFormat(seconds) {
    const date = new Date();
    date.setTime(seconds * 1000);
    return (
        date.toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        }) + ":" + (date.getMilliseconds() + 1000).toString().slice(1, 3)
        // (date.getMilliseconds() !== 0
        //     ? ":" + (date.getMilliseconds() + 1000).toString().slice(1)
        //     : "")
    );
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
