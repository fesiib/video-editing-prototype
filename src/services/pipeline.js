import axios from "axios";

const URL = "http://internal.kixlab.org:7778/";

export function requestSuggestions(requestData) {
	return new Promise((resolve, reject) => {
		const url = `${URL}intent`;
		const data = requestData;
		const config = {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
			},
			responseType: 'json',
		};
		axios.post(url, data, config).then((response) => {
			resolve(response.data);
		}).catch((error) => {
			reject(error);
		});
	});
}

export function requestSummary(requestData) {
	return new Promise((resolve, reject) => {
		const url = `${URL}summary`;;
		axios.post(url, requestData).then((response) => {
			resolve(response.data);
		}
		).catch((error) => {
			reject(error);
		}
		);
	});
}

export function requestAmbiguousParts(requestData) {
	return new Promise((resolve, reject) => {
		const url = `${URL}ambiguous`;
		axios.post(url, requestData).then((response) => {
			resolve(response.data);
		}
		).catch((error) => {
			reject(error);
		}
		);
	});
}