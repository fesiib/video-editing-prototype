export function selectiveRestrictToVerticalAxis({
	transform,
	draggingNodeRect,
}) {
	console.log(draggingNodeRect);
	return {
		...transform,
		y: 0,
	};
}