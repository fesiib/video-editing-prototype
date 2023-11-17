import { action, makeAutoObservable, makeObservable, observable, runInAction, toJS } from "mobx";

import CommonState from "./commonState";

import { randomUUID, roundNumber } from "../../utilities/genericUtilities";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import EditState from "./editState";

class BubbleState {
	parent = null;
	id = "";

	edit = null;
	parsingResult = [];
	requestProcessingMode = "";
	requestId = "";

	appliedEditId = "";

	toggle = false;
	time = 0;
	type = ""; // userCommand, parsingResult, edit, systemMessage, summaryMessage
	content = "";
	processed = false;

	trackId = 0;

	constructor(domainStore, tab, trackId, time, type, requestProcessingMode, requestId) {
		makeAutoObservable(this, {}, { autoBind: true });
		this.domainStore = domainStore;
		this.parent = tab;
		this.id = "bubble-" + randomUUID();

		// edit
		if (type === domainStore.bubbleTypes.edit) {
			this.edit = new EditState(domainStore, tab, this, true, trackId);
		}
		else {
			this.edit = null;
		}

		// parsing result
		this.parsingResult = {
			text: "",
			spatial: [],
			temporal: [],
			edit: [],
			custom: [],
		};

		this.toggle = false;
		this.time = time;
		this.type = type;
		this.content = "";
		this.processed = (type !== domainStore.bubbleTypes.edit);
		this.requestProcessingMode = requestProcessingMode;
		this.requestId = requestId;

		this.appliedEditId = "";
	}

	getDeepCopy() {
		const newBubble = new BubbleState(
			this.domainStore,
			this.parent,
			this.trackId,
			this.time,
			this.type,
			this.requestProcessingMode,
			this.requestId,
		);
		if (this.type === this.domainStore.bubbleTypes.edit) {
			newBubble.edit = this.edit.getDeepCopy();
		}
		else {
			newBubble.edit = null;
		}
		newBubble.toggle = this.toggle;
		newBubble.content = this.content;
		newBubble.processed = this.processed;
		newBubble.parsingResult = {
			text: this.parsingResult.text,
			spatial: [ ...this.parsingResult.spatial ],
			temporal: [ ...this.parsingResult.temporal ],
			edit: [ ...this.parsingResult.edit ],
			custom: [ ...this.parsingResult.custom ],
		};
		// NOTE: not sure if this is the right behavior
		newBubble.appliedEditId = "";
		return newBubble;
	}

	setToggle(toggle) {
		let result = [];
		if (this.toggle === toggle) {
			return result;
		}
		if (this.type === this.domainStore.bubbleTypes.edit
			&& this.edit !== null
		) {
			if (toggle && this.appliedEditId === "") {
				// add edit & appliedEditId
				result = this.parent.addEditFromBubble(this.id);
			}
			else if (!toggle && this.appliedEditId !== "") {
				// remove edit appliedEditId
				this.parent.deleteEdits([this.appliedEditId]);
				this.appliedEditId = "";
			}
		}
		this.toggle = toggle;
		return result;
	}

	setContent(content) {
		this.content = content;
	}

	setParsingResult(text, spatial, temporal, edit, custom) {
		this.parsingResult.text = text;
		this.parsingResult.spatial = [...spatial];
		this.parsingResult.temporal = [...temporal];
		this.parsingResult.edit = [...edit];
		this.parsingResult.custom = [...custom];
	}

	setRequestProcessingMode(mode) {
		this.requestProcessingMode = mode;
	}

	setRequestId(requestId) {
		this.requestId = requestId;
	}

	setAppliedEditId(editId) {
		this.appliedEditId = editId;
	}

	completedProcessing() {
		this.processed = true;
	}

	saveFirebase(userId, taskIdx) {
		const bubbleCollection = collection(firestore,
			this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.bubbleCollection);
		const bubbleId = this.id;
		const bubbleDoc = doc(bubbleCollection, bubbleId).withConverter(this.bubbleStateConverter);		
		return new Promise((resolve, reject) => {
			setDoc(bubbleDoc, this, {merge: false}).then(() => {
				//console.log(`edit ${editId} saved: `, editId, userId, this.domainStore.rootStore.editCollection);
				resolve();
			}).catch((error) => {
				reject(`edit ${bubbleId} save error: ` + error.message);
			});
		});
	}

	fetchFirebase(userId, taskIdx, bubbleId) {
		const bubbleCollection = collection(firestore,
			this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.bubbleCollection);
		const bubbleDoc = doc(bubbleCollection, bubbleId).withConverter(this.bubbleStateConverter);		
		return new Promise((resolve, reject) => {
			getDoc(bubbleDoc).then(action(async (fetchedBubbleState) => {
				//console.log("fetched edit", fetchedEditState);
				const data = fetchedBubbleState.exists() ? fetchedBubbleState.data() : null;
				if (data === null || data.id === undefined) {
					//TODO: maybe reset edit state
					resolve(false);
				}

				this.id = data.id;
				this.toggle = data.toggle;
				this.time = data.time;
				this.type = data.type;
				this.content = data.content;
				this.processed = data.processed;
				this.trackId = data.trackId;
				this.requestProcessingMode = data.requestProcessingMode;
				this.requestId = data.requestId;
				this.appliedEditId = data.appliedEditId;
				
				if (this.type === this.domainStore.bubbleTypes.edit) {
					const newEdit = new EditState(
						this.domainStore, this.parent, this, true, this.trackId
					);
					try {
						const success = await newEdit.fetchFirebase(userId, taskIdx, data.editId);
						if (success) {
							runInAction(() => {
								this.edit = newEdit;
							});
						}
					} catch (error) {
						this.edit = newEdit;
						this.content = "Error fetching: " + error.message;
						console.log(error);
					}
				}
				else {
					this.edit = null;
				}

				this.parsingResult = {
					text: data.parsingResult.text,
					spatial: [ ...data.parsingResult.spatial ],
					temporal: [ ...data.parsingResult.temporal ],
					edit: [ ...data.parsingResult.edit ],
					custom: [ ...data.parsingResult.custom ],
				};
				resolve(true);
			})).catch((error) => {
				reject("edit fetch error: " + error.message);
			});
		});
	}

	bubbleStateConverter = {
		toFirestore: function(bubbleState) {
			const data = {
				id: bubbleState.id,
				toggle: bubbleState.toggle,
				time: bubbleState.time,
				type: bubbleState.type,
				content: bubbleState.content,
				processed: bubbleState.processed,
				trackId: bubbleState.trackId,
				editId: bubbleState.edit.id,
				parsingResult: {
					text: bubbleState.parsingResult.text,
					spatial: [ ...bubbleState.parsingResult.spatial ],
					temporal: [ ...bubbleState.parsingResult.temporal ],
					edit: [ ...bubbleState.parsingResult.edit ],
					custom: [ ...bubbleState.parsingResult.custom ],
				},
				requestProcessingMode: bubbleState.requestProcessingMode,
				requestId: bubbleState.requestId,
				appliedEditId: bubbleState.appliedEditId,
			};
			return data;
		},
		fromFirestore: function(snapshot, options) {
			const data = snapshot.data(options);
			//console.log("from", data);
			return data;
		}
	}
}

export default BubbleState;