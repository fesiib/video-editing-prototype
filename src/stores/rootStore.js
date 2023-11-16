import { action, makeAutoObservable, toJS } from "mobx";
import DomainStore from "./domainStore";
import UIStore from "./uiStore";
import UserStore from "./userStore";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { randomUUID } from "../utilities/genericUtilities";
import { firestore } from "../services/firebase";
import axios from "axios";

const ADDR = "http://internal.kixlab.org:7778/"

const REQUEST_TYPES = {
    saveOnServer: {
        serverAddr: ADDR,
        route: "save-user"
    },
};

class LogData {
	userId = null;
	videoId = null;
	systemSetting = false;
	taskIdx = null;
	time = null;
	msg = null;
	data = null;


	constructor(
		userId,
		videoId,
		systemSetting,
		taskIdx,
		time,
		msg,
		data
	) {
		this.userId = userId;
		this.videoId = videoId;
		this.systemSetting = systemSetting;
		this.taskIdx = taskIdx;
		this.time = time;
		this.msg = msg;
		this.data = data;
	}

	toString() {
        return `user: ${this.userId}, video: ${this.videoId}, treatment: ${this.systemSetting}, task: ${this.taskIdx}, time: ${this.time}, message: ${this.msg}, data: ${this.data}`;
	}
}

const LogDataConverter = {
	toFirestore: function(logData) {
		return {
			userId: logData.userId,
			videoId: logData.videoId,
			systemSetting: logData.systemSetting,
			taskIdx: logData.taskIdx,
			time: logData.time,
			msg: logData.msg,
			data: logData.data,
		};
	},
	fromFirestore: function(snapshot, options) {
		const curData = snapshot.data(options);
		return new LogData(
			curData.userId,
			curData.videoId,
			curData.systemSetting,
			curData.taskIdx,
			curData.time,
			curData.msg,
			curData.data
		);
	}
};

class RootStore {
	collection = "chat";
	logCollection = "logs";
	videoCollection = "videos";
	editCollection = "edits";
	tabCollection = "tabs";
	bubbleCollection = "bubbles";

	// doc = userId
	// data = {userStore, uiStore, domainStore}

    constructor() {
        makeAutoObservable(this);
        this.uiStore = new UIStore(this);
        this.domainStore = new DomainStore(this);
		this.userStore = new UserStore(this);
    }

	resetTempState() {
		this.uiStore.resetTempState();
	}

	resetAll() {
		this.uiStore.resetAll();
		this.domainStore.resetAll();
	}

	fetchTask(userId, taskIdx) {
		return new Promise((resolve, reject) => {
			if (taskIdx >= 0) {
				this.domainStore.fetchFirebase(userId, taskIdx, this.userStore.videoId).then(action(() => {
					console.log("fetched Domain");
					if (this.domainStore.in_mainVideos.length === 0) {
						this.domainStore.loadVideo(this.userStore.videoUrl, this.userStore.videoId);
					}
					resolve();
				})).catch((error) => {
					reject(error);
				});
				//this.uiStore.fetchFirebase(userId, taskIdx, this.videoId);
			}
			else {
				resolve();
			}
		});
	}

	fetchFirebase() {
		if (!this.userStore.isLoggedIn) {
			return;
		}
		const userId = this.userStore.userId;
		return new Promise((resolve, reject) => {
			this.userStore.fetchFirebase().then(action((taskIdx) => {
				console.log("fetched User");
				this.fetchTask(userId, taskIdx).then(() => {
					resolve();
				}).catch((error) => {
					reject(error);
				});				
			})).catch((error) => {
				reject(error);
			});
		});
	}

	saveFirebase() {
		if (!this.userStore.isLoggedIn) {
			return;
		}
		const userId = this.userStore.userId;
		return new Promise((resolve, reject) => {
			this.userStore.saveFirebase().then((taskIdx) => {
				console.log("saved User");
				if (taskIdx >= 0) {
					this.domainStore.saveFirebase(userId, taskIdx).then(() => {
						console.log("saved Domain");
						resolve();
					}).catch((error) => {
						reject(error);
					});
					//this.uiStore.saveFirebase(userId, taskIdx);
				}
				else {
					resolve();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	resetFirebase() {
		if (!this.userStore.isLoggedIn) {
			return;
		}
		const taskKeys = Object.keys(this.userStore.videoLinks);
		const userId = this.userStore.userId;
		const rootCollection = collection(firestore, this.collection);
		const curUserStore = doc(rootCollection, userId);
		const curVideoCollection = collection(curUserStore, this.videoCollection);
		const curTabCollection = collection(curUserStore, this.tabCollection);
		const curBubbleCollection = collection(curUserStore, this.bubbleCollection);
		const curEditCollection = collection(curUserStore, this.editCollection);
		const taskCollections = taskKeys.map((taskKey) => {
			return collection(curUserStore, taskKey);
		});
		return new Promise((resolve, reject) => {
			let taskGets = [];
			let taskDeletes = [];
			for (let i = 0; i < taskCollections.length; i++) {
				const curTaskCollection = taskCollections[i];
				taskGets.push(getDocs(curTaskCollection));
			}
			Promise.all(taskGets).then((querySnapshots) => {
				for (let i = 0; i < querySnapshots.length; i++) {
					const querySnapshot = querySnapshots[i];
					querySnapshot.forEach((singleDoc) => {
						taskDeletes.push(deleteDoc(singleDoc.ref));
					});
				}
				Promise.all(taskDeletes).then(() => {
					console.log("deleted tasks");
					getDocs(curVideoCollection).then((querySnapshot) => {
						querySnapshot.forEach((singleDoc) => {
							deleteDoc(singleDoc.ref);
						});
						getDocs(curTabCollection).then((querySnapshot) => {
							querySnapshot.forEach((singleDoc) => {
								deleteDoc(singleDoc.ref);
							});
							getDocs(curBubbleCollection).then((querySnapshot) => {
								querySnapshot.forEach((singleDoc) => {
									deleteDoc(singleDoc.ref);
								});
								getDocs(curEditCollection).then((querySnapshot) => {
									querySnapshot.forEach((singleDoc) => {
										deleteDoc(singleDoc.ref);
									});
									deleteDoc(curUserStore).then(() => {
										console.log("deleted User");
										resolve();
									}).catch((error) => {
										reject("user save error: " + error.message);
									});
								}).catch((error) => {
									reject("user save error: " + error.message);
								});
							}).catch((error) => {
								reject("user save error: " + error.message);
							});
						}).catch((error) => {
							reject("user save error: " + error.message);
						});
					}).catch((error) => {
						reject("user save error: " + error.message);
					});
				}).catch((error) => {
					reject("user save error: " + error.message);
				});
			}).catch((error) => {
				reject("user save error: " + error.message);
			});
		});
	}

	saveOnServer() {
		if (!this.userStore.isLoggedIn) {
			return;
		}
		const taskKeys = Object.keys(this.userStore.videoLinks);
		const userId = this.userStore.userId;
		const rootCollection = collection(firestore, this.collection);
		const curUserStore = doc(rootCollection, userId);
		const curVideoCollection = collection(curUserStore, this.videoCollection);
		const curTabCollection = collection(curUserStore, this.tabCollection);
		const curBubbleCollection = collection(curUserStore, this.bubbleCollection);
		const curEditCollection = collection(curUserStore, this.editCollection);
		const logsCollection = collection(curUserStore, this.logCollection);
		const taskCollections = taskKeys.map((taskKey) => {
			return collection(curUserStore, taskKey);
		});

		let allData = {
			dataId: randomUUID(),
			userId: this.userStore.email,
			userStore: {},
			tasks: [],
			videos: [],
			tabs: [],
			bubbles: [],
			edits: [],
			logs: [],
		};

		return new Promise((resolve, reject) => {
			let taskGets = [];
			for (let i = 0; i < taskCollections.length; i++) {
				const curTaskCollection = taskCollections[i];
				taskGets.push(getDocs(curTaskCollection));
			}
			Promise.all(taskGets).then((querySnapshots) => {
				for (let i = 0; i < querySnapshots.length; i++) {
					const querySnapshot = querySnapshots[i];
					querySnapshot.forEach((singleDoc) => {
						allData.tasks.push(singleDoc.data());
					});
				}
				const videos = getDocs(curVideoCollection);
				const tabs = getDocs(curTabCollection);
				const bubbles = getDocs(curBubbleCollection);
				const edits = getDocs(curEditCollection);
				const userStore = getDoc(curUserStore);
				const logs = getDocs(logsCollection);
				Promise.all([
					videos, tabs, bubbles, edits, userStore, logs
				]).then((querySnapshots) => {
					const viodeoQuerySnapshot = querySnapshots[0];
					viodeoQuerySnapshot.forEach((singleDoc) => {
						allData.videos.push(singleDoc.data());
					});
					const tabQuerySnapshot = querySnapshots[1];
					tabQuerySnapshot.forEach((singleDoc) => {
						allData.tabs.push(singleDoc.data());
					});
					const bubbleQuerySnapshot = querySnapshots[2];
					bubbleQuerySnapshot.forEach((singleDoc) => {
						allData.bubbles.push(singleDoc.data());
					});
					const editQuerySnapshot = querySnapshots[3];
					editQuerySnapshot.forEach((singleDoc) => {
						allData.edits.push(singleDoc.data());
					});
					const userStoreSnapshot = querySnapshots[4];
					allData.userStore = userStoreSnapshot.data();
					
					const logQuerySnapshot = querySnapshots[5];
					logQuerySnapshot.forEach((singleDoc) => {
						allData.logs.push(singleDoc.data());
					});

					console.log("saving -->", allData);
					const requestCfg = REQUEST_TYPES.saveOnServer;
					const url = requestCfg.serverAddr + requestCfg.route;
					const config = {
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
							'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
						},
						responseType: 'json',
					};

					axios.post(url, {data: allData}, config).then((response) => {
						resolve("success");
					}).catch((error) => {
						reject("server save error (request): " + error.message);
					});
				}).catch((error) => {
					console.log(error);
					reject("server save error (parts): " + error.message);
				});
			}).catch((error) => {
				reject("server save error (tasks): " + error.message);
			});
		});
	}

	logData(msg, data) {
		return;
		if (!this.userStore.isLoggedIn || !this.userStore.isTaskChosen) {
			return;
		}
		const userId = this.userStore.userId;
		const videoId = this.userStore.videoId;
		const systemSetting = this.userStore.systemSetting;
		const tabId = this.domainStore.curTab.id;
		const taskIdx = this.userStore.curSessionIdx * 2 + this.userStore.curVideoIdx;
		const time = Date.now();
		const rootCollection = collection(firestore, this.collection);
		const userDoc = doc(rootCollection, userId);
		const logCollection = collection(userDoc, this.logCollection);
		const curLogDoc = doc(logCollection).withConverter(LogDataConverter);
		setDoc(curLogDoc, new LogData(
			userId, videoId, systemSetting,
			taskIdx, time, msg, {
				...data,
				tabId: tabId,
			}
		)).then(() => {
			console.log("logged");
		}).catch((error) => {
			console.log("Logger Error:", error);
		});
	}
}

export default RootStore;
