import axios from "axios";

const URL = "http://192.168.50.153:9888/";

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