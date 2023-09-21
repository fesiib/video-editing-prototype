
export function getTaskAssignments(N = 16) {
	let taskAssignments = {};

	/*
		v1, v2
		ours, baseline

		v1-o, v2-b, v3-o, v4-b
		v1-b, v2-o, v3-o, v4-b
		v2-o, v1-b, v3-o, v4-b
		v2-b, v1-o, v3-o, v4-b
		
		v1-o, v2-b, v3-o, v4-b
		v1-b, v2-o, v3-o, v4-b
		v2-o, v1-b, v3-o, v4-b
		v2-b, v1-o, v3-o, v4-b
		
	*/
	const shuffle = (array) => {
		let currentIndex = array.length;
		while (currentIndex > 0) {
			const randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex], array[currentIndex]];
		}
		return array;
	}

	//const participantIds = shuffle([...Array(N).keys()]);
	const participantIds = [7, 13, 8, 11, 5, 15, 1, 6, 9, 3, 4, 10, 0, 14, 2, 12];

	for (let participantId = 0; participantId < N; participantId++) {
		const task1Num = participantId % 4;
		const task1Order = task1Num < 2 ? ["video-1", "video-2"] : ["video-2", "video-1"];
		const baseline1 = task1Num % 2 ? task1Order[1] : task1Order[0];

		const task2Num = Math.floor(participantId / 4);
		const task2Order = task2Num < 2 ? ["video-3", "video-4"] : ["video-4", "video-3"];
		const baseline2 = task2Num % 2 ? task2Order[1] : task2Order[0];
		taskAssignments[participantIds[participantId]] = [
			{
				videoIds: task1Order,
				baseline: baseline1,
			},
			{
				videoIds: task2Order,
				baseline: baseline2,
			},
		];
	}

	// basic ones
	for (let participantId = 0; participantId < N; participantId++) {
		let prefixText = `P${participantId}:`;
		let session1 = `${taskAssignments[participantId][0].videoIds[0]} - ${taskAssignments[participantId][0].videoIds[0] === taskAssignments[participantId][0].baseline ? "baseline" : "ours"}`;
		let session2 = `${taskAssignments[participantId][0].videoIds[1]} - ${taskAssignments[participantId][0].videoIds[1] === taskAssignments[participantId][0].baseline ? "baseline" : "ours"}`;
		let session3 = `${taskAssignments[participantId][1].videoIds[0]} - ${taskAssignments[participantId][1].videoIds[0] === taskAssignments[participantId][1].baseline ? "baseline" : "ours"}`;
		let session4 = `${taskAssignments[participantId][1].videoIds[1]} - ${taskAssignments[participantId][1].videoIds[1] === taskAssignments[participantId][1].baseline ? "baseline" : "ours"}`;
		console.log(`${prefixText} ${session1}, ${session2}, ${session3}, ${session4}`);
		taskAssignments[participantId].push(
			{
				videoIds: ["tutorial"],
				baseline: "",
			},
			{
				videoIds: ["fs-video-2"],
				baseline: "",
			},
			{
				videoIds: ["fs-video-3"],
				baseline: "",
			},
			{
				videoIds: ["fs-video-4"],
				baseline: "",
			},
			{
				videoIds: ["fs-video-5"],
				baseline: "",
			},
			{
				videoIds: ["fs-video-6"],
				baseline: "",
			},
		);
	}
	return taskAssignments;
}