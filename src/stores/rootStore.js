import { action, makeAutoObservable, toJS } from "mobx";
import DomainStore from "./domainStore";
import UIStore from "./uiStore";
import UserStore from "./userStore";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { firestore } from "../services/firebase";

class LogData {
	userId = null;
	taskIdx = null;
	time = null;
	msg = null;
	data = null;

	constructor(userId, taskIdx, time, msg, data) {
		this.userId = userId;
		this.taskIdx = taskIdx;
		this.time = time;
		this.msg = msg;
		this.data = data;
	}

	toString() {
        return `${this.userId}, ${this.taskIdx}, ${this.time}, ${this.msg}, ${this.data}`;
	}
}

const LogDataConverter = {
	toFirestore: function(logData) {
		return {
			//userId: logData.userId,
			taskIdx: logData.taskIdx,
			time: logData.time,
			msg: logData.msg,
			data: logData.data,
		};
	},
	fromFirestore: function(snapshot, options) {
		const curData = snapshot.data(options);
		return new LogData(curData.userId, curData.taskIdx, curData.time, curData.msg, curData.data);
	}
};

class RootStore {
	collection = "pilots";
	logCollection = "logs";
	videoCollection = "videos";
	intentCollection = "intents";
	editCollection = "edits";

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
		const curIntentCollection = collection(curUserStore, this.intentCollection);
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
						getDocs(curIntentCollection).then((querySnapshot) => {
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
		});
	}

	logData(msg, data) {
		if (!this.userStore.isLoggedIn || !this.userStore.isTaskChosen) {
			return;
		}
		const userId = this.userStore.userId;
		const taskIdx = this.userStore.curSessionIdx * 2 + this.userStore.curVideoIdx;
		const time = Date.now();
		const rootCollection = collection(firestore, this.collection);
		const userDoc = doc(rootCollection, userId);
		const logCollection = collection(userDoc, this.logCollection);
		const curLogDoc = doc(logCollection).withConverter(LogDataConverter);
		setDoc(curLogDoc, new LogData(userId, taskIdx, time, msg, data)).then(() => {
			console.log("logged");
		}).catch((error) => {
			console.log("Logger Error:", error);
		});
	}
}

export default RootStore;
