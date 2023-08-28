import axios from "axios";

export function requestSuggestions(requestData) {
	return new Promise((resolve, reject) => {
		const url = "http://internal.kixlab.org:9888/intent";
		axios.post(url, requestData).then((response) => {
			resolve(response.data);
		}).catch((error) => {
			reject(error);
		});
	});
}

export function requestSummary(requestData) {
	return new Promise((resolve, reject) => {
		const url = "http://internal.kixlab.org:9888/summary";
		axios.post(url, requestData).then((response) => {
			resolve(response.data);
		}
		).catch((error) => {
			reject(error);
		}
		);
	});
}