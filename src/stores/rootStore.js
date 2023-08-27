import { makeAutoObservable } from "mobx";
import DomainStore from "./domainStore";
import UIStore from "./uiStore";
import UserStore from "./userStore";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
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

	fetchLastSession() {
		if (!this.userStore.isLoggedIn) {
			return;
		}
		const userId = this.userStore.userId;
		return new Promise((resolve, reject) => {
			this.userStore.fetchLastSession().then((taskIdx) => {
				console.log("fetched User");
				if (taskIdx >= 0) {
					this.domainStore.fetchLastSession(userId, taskIdx).then(() => {
						console.log("fetched Domain");
						resolve();
					}).catch((error) => {
						reject(error);
					});
					//this.uiStore.fetchLastSession(userId, taskIdx);
				}
				else {
					resolve();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	saveSession() {
		if (!this.userStore.isLoggedIn) {
			return;
		}
		const userId = this.userStore.userId;
		return new Promise((resolve, reject) => {

			this.userStore.saveSession().then((taskIdx) => {
				console.log("saved User");
				if (taskIdx >= 0) {
					this.domainStore.saveSession(userId, taskIdx).then(() => {
						console.log("saved Domain");
						resolve();
					}).catch((error) => {
						reject(error);
					});
					//this.uiStore.saveSession(userId, taskIdx);
				}
				else {
					resolve();
				}
			}).catch((error) => {
				reject(error);
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
