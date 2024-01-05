import { action, makeAutoObservable, runInAction, set, toJS } from "mobx";

import EditState from "./objects/editState";

import { randomUUID, sliceTextArray } from "../utilities/genericUtilities";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../services/firebase";
import BubbleState from "./objects/bubbleState";

class TabState {
	trackId = 0;

	title = "Untitled";

	id = "";
	idx = 0;

	textCommand = "";
	sketchCommand = [];
	sketchPlayPosition = -1;
	
	systemBubbles = [];
	userBubbles = [];

	editOperationKey = "";
	activeEdits = [];

	suggestedEditOperationKeys = [];
	suggestedEdits = [];
	
	processingMode = "from-scratch"; // from-scratch, add-more, adjust-selected

    constructor(domainStore, idx, textCommand, sketchCommand, sketchPlayPosition, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
		
		this.trackId = trackId;

		this.title = "Untitled";
		
		this.id = `tab-${randomUUID()}`;
		this.idx = idx;

		this.textCommand = textCommand;
		this.sketchCommand = [...sketchCommand];
		this.sketchPlayPosition = sketchPlayPosition;
        
		this.systemBubbles = [];
		this.userBubbles = [];

		this.editOperationKey = Object.keys(domainStore.editOperations)[0];
		this.activeEdits = [];

		this.suggestedEditOperationKeys = [];
		this.suggestedEdits = [];
		
		this.processingMode = "from-scratch";
    }

	setTitle(title) {
		this.title = title;
	}
	setIdx(idx) {
		this.idx = idx;
	}
	setProcessingMode(mode) {
		this.processingMode = mode;
	}

	setEditOperationKey(key) {
		this.editOperationKey = key;
	}

	setTextCommand(text) {
		this.textCommand = text;
	}

	setSketchCommand(sketch) {
		this.sketchCommand = [...sketch];
	}

	setSketchPlayPosition(pos) {
		this.sketchPlayPosition = pos;
	}

	setSuggestedEditOperationKeys(operations) {
		this.suggestedEditOperationKeys = [...operations];
	}

	setSuggestedEdits(edits) {
		this.suggestedEdits = [...edits];
	}

	addActiveEdit(first, second) {
		const start = Math.min(first, second);
		const finish = Math.max(first, second);
		let newEdit = new EditState(this.domainStore, this, null, false, this.trackId);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish, 
			offset: start,
			z: this.tabPos + 1,
		});
		this.activeEdits.push(newEdit);
		newEdit.zoomParameters = {
			...newEdit.zoomParameters,
			zoomDurationStart: Math.max(3, newEdit.commonState.sceneDuration),
		}
		newEdit.zoomParameters = {
			...newEdit.zoomParameters,
			zoomDurationEnd: Math.max(3, newEdit.commonState.sceneDuration - newEdit.zoomParameters.zoomDurationStart),
		}
		return this.activeEdits[this.activeEdits.length - 1];
	}
	
	setActiveEdits(edits) {
		this.activeEdits = [...edits];
	}

	addBubble(time, type, requestProcessingMode, requestId) {
		// userCommand, systemMessage, parsingResult, edit;
		let newBubble = new BubbleState(
			this.domainStore, this, this.trackId, time, type, requestProcessingMode, requestId,
		);
		return this.addBubbleObj(newBubble);
	}

	addBubbleObj(newBubble) {
		newBubble.parent = this;
		const type = newBubble.type;
		if (type === this.domainStore.bubbleTypes.userCommand) {
			this.userBubbles.push(newBubble);
		}
		else if (type === this.domainStore.bubbleTypes.systemMessage) {
			this.systemBubbles.push(newBubble);
		}
		else if (type === this.domainStore.bubbleTypes.parsingResult) {
			this.systemBubbles.push(newBubble);
		}
		else if (type === this.domainStore.bubbleTypes.edit) {
			this.systemBubbles.push(newBubble);
		}
		else if (type === this.domainStore.bubbleTypes.summaryMessage) {
			this.systemBubbles.push(newBubble);
		}
		else {
			console.log("Error adding Bubble");
			return null;
		}
		return newBubble;
	}

	deleteEdits(selectedIds) {
		for (let bubble of this.systemBubbles) {
			if (bubble.type !== this.domainStore.bubbleTypes.edit) {
				continue;
			}
			if (bubble.toggle === true && selectedIds.includes(bubble.appliedEditId)) {
				bubble.toggle = false;
				bubble.setAppliedEditId("");
			}
		}
		this.activeEdits = this.activeEdits.filter((edit) => {
            const isSelected = selectedIds.includes(edit.commonState.id);
            return !isSelected;
        });
		this.systemBubbles = this.systemBubbles.filter((bubble) => {
			if (bubble.type !== this.domainStore.bubbleTypes.edit) {
				return true;
			}
			const isSelected = selectedIds.includes(bubble.edit.commonState.id);
			if (isSelected) {
				bubble.setToggle(false);
			}
			return !isSelected;
		});
		this.domainStore.rootStore.uiStore.selectTimelineObjects(
			this.domainStore.rootStore.uiStore.timelineControls.selectedTimelineItems.filter((item) => {
				return !selectedIds.includes(item?.commonState?.id);
			})
		); 
	}

	deleteBubbles(selectedIds) {
		this.systemBubbles = this.systemBubbles.filter((bubble) => {
			const isSelected = selectedIds.includes(bubble.id);
			bubble.setToggle(false);
			return !isSelected;
		});
		this.userBubbles = this.userBubbles.filter((bubble) => {
			const isSelected = selectedIds.includes(bubble.id);
			bubble.setToggle(false);
			return !isSelected;
		});
	}

	clearBubbles() {
		for (let bubble of this.systemBubbles) {
			bubble.setToggle(false);
		}
		for (let bubble of this.userBubbles) {
			bubble.setToggle(false);
		}
		this.systemBubbles = [];
		this.userBubbles = [];
	}

	getDeepCopy() {
		let systemBubbles = [];
		let userBubbles = [];
		for (let bubble of this.systemBubbles) {
			systemBubbles.push(bubble.getDeepCopy());
		}
		for (let bubble of this.userBubbles) {
			userBubbles.push(bubble.getDeepCopy());
		}

		let newTab = new TabState(
			this.domainStore,
			this.idx,
			this.textCommand,
			this.sketchCommand,
			this.sketchPlayPosition,
			this.trackId,
		);
		newTab.title = this.title;
		newTab.userBubbles = userBubbles;
		newTab.systemBubbles = systemBubbles;
		newTab.editOperationKey = this.editOperationKey;
		newTab.activeEdits = this.activeEdits.slice(0).map((edit) => {
			const newEdit = edit.getDeepCopy();
			newEdit.tab = newTab;
			return newEdit;
		});
		newTab.processingMode = this.processingMode;
		return newTab;
	}

	addEditFromBubble(bubbleId) {
		const suggestedBubble = this.systemBubbles.find((bubble) => bubble.id === bubbleId);

		if (suggestedBubble === undefined) {
			return [];
		}
		
		const suggestedEdit = suggestedBubble.edit;
		if (suggestedBubble.type !== this.domainStore.bubbleTypes.edit
			|| suggestedEdit === null
		) {
			return []
		}
		
		const newEdit = suggestedEdit.getDeepCopy();
		newEdit.isSuggested = false;
		let deleteIds = [];
		let newEdits = [newEdit];
		for (let edit of this.activeEdits) {
			const left = Math.max(newEdit.commonState.offset, edit.commonState.offset);
			const right = Math.min(newEdit.commonState.end, edit.commonState.end);
			if (left < right) {
				if (left === edit.commonState.offset && right === edit.commonState.end) {
					deleteIds.push(edit.commonState.id);
				}
				else if (left === edit.commonState.offset) {
					edit.commonState.setMetadata({
						start: (right - edit.commonState.offset) + edit.commonState.start,
						offset: right,
					});
				}
				else if (right === edit.commonState.end) {
					edit.commonState.setMetadata({
						finish: (left - edit.commonState.offset) + edit.commonState.start,
					});
				}
				else {
					let editCopy = edit.getDeepCopy();
					editCopy.commonState.setMetadata({
						start: (right - edit.commonState.offset) + edit.commonState.start,
						offset: right,
					});
					edit.commonState.setMetadata({
						finish: (left - edit.commonState.offset) + edit.commonState.start,
					});
					newEdits.push(editCopy);
				}
			}
		}
		this.deleteEdits(deleteIds);
		this.activeEdits.push(...newEdits);
		return newEdits;
	} 

	showEditFromBubble(bubbleId) {
		//TODO: preview of the edit
		return;
	}

	getObjectById(id) {
		const fromActive = this.activeEdits.find((edit) => edit.commonState.id === id);
		const fromUser = this.userBubbles.find(
			(bubble) => bubble.edit !== null && bubble.edit.commonState.id === id
		);
		const fromSystem = this.systemBubbles.find(
			(bubble) => bubble.edit !== null &&  bubble.edit.commonState.id === id
		);
		if (fromActive !== undefined) {
			return fromActive;
		}
		else if (fromUser !== undefined) {
			return fromUser;
		}
		else if (fromSystem !== undefined) {
			return fromSystem;
		}
		else {
			return null;
		}
	}

	getCanvasObjectById(id) {
		if (this.editOperationKey === "crop" || this.editOperationKey === "shape") {
			const realId = id.substring(3);
			return this.getObjectById(realId);
		}
		return this.getObjectById(id);
	}

	get tabPos() {
		return this.domainStore.tabs.findIndex((tab) => tab.id === this.id);
	}

	get activeObjectsVisibility() {
		const playPosition = this.domainStore.rootStore.uiStore.timelineControls.playPosition;
		let result = [];
		for (let edit of this.activeEdits) {
			result.push(edit.isVisible(playPosition));
		}
		return result;
	}

	get editOperation() {
		if (this.editOperationKey === "") {
			return null;
		}
		return this.domainStore.editOperations[this.editOperationKey];
	}

	get requestParameters() {
		return {
			processingMode: this.processingMode,
			hasText: this.textCommand !== "",
			hasSketch: this.sketchCommand.length > 0,
			text: this.textCommand,
			sketchRectangles: this.sketchPlayPosition >= 0 ? [...this.sketchCommand] : [],
			sketchFrameTimestamp: this.sketchCommand.length > 0 ? this.sketchPlayPosition : -1,
			editOperation: this.editOperationKey,
		}
	}

	get processingAllowed() {
		return this.textCommand !== "" || (this.sketchCommand.length > 0 && this.sketchPlayPosition >= 0);
	}

	get timeOrderedBubbles() {
		console.log(this.systemBubbles.length, this.userBubbles.length)
		const bubbles = [...this.systemBubbles,
			...this.userBubbles
		].sort((a, b) => {
			return a.time - b.time;
		});
		return bubbles;
	}

	saveFirebase(userId, taskIdx) {
		const tabCollection = collection(
			firestore, this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.tabCollection
		);
		const tabId = this.id;
		const tabDoc = doc(tabCollection, tabId).withConverter(this.tabStateConverter);
		return new Promise(async (resolve, reject) => {
			try {
				let allEditPromises = [];
				let allBubblePromises = [];
				for (let edit of this.activeEdits) {
					allEditPromises.push(edit.saveFirebase(userId, taskIdx));
				}	
				for (let edit of this.suggestedEdits) {
					allEditPromises.push(edit.saveFirebase(userId, taskIdx));	
				}
				for (let bubble of this.systemBubbles) {
					allBubblePromises.push(bubble.saveFirebase(userId, taskIdx));
				}
				for (let bubble of this.userBubbles) {
					allBubblePromises.push(bubble.saveFirebase(userId, taskIdx));
				}
				await Promise.all(allEditPromises);
				await Promise.all(allBubblePromises);
			} catch (error) {
				reject("edit/bubble save error: " + error.message);
			}
			setDoc(tabDoc, this, {merge: false}).then(() => {
				resolve();
			}).catch((error) => {
				reject("tab save error: " + error);
			});
		});
	}

	fetchFirebase(userId, taskIdx, tabId) {
		const tabCollection = collection(
			firestore, this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.tabCollection
		);
		const tabDoc = doc(tabCollection, tabId).withConverter(this.tabStateConverter);
		return new Promise((resolve, reject) => {
			getDoc(tabDoc).then(action(async (fetchedTabState) => {
				const data = fetchedTabState.exists() ? fetchedTabState.data() : null;
				if (data === null || data.id === undefined) {
					resolve(false);
				}

				this.id = data.id;
				this.idx = data.idx;
				this.trackId = data.trackId;

				this.title = data.title;

				this.textCommand = data.textCommand;
				this.sketchCommand = data.sketchCommand;
				this.sketchPlayPosition = data.sketchPlayPosition;

				this.editOperationKey = data.editOperationKey;
				this.suggestedEditOperationKeys = data.suggestedEditOperationKeys;
				
				this.processingMode = data.processingMode;

				this.activeEdits = [];
				this.suggestedEdits = [];
				
				this.systemBubbles = [];
				this.userBubbles = [];

				for (let editId of data.activeEdits) {
					const newEdit = new EditState(
						this.domainStore,
						this,
						null,
						false,
						this.trackId,
					);
					try {
						const success = await newEdit.fetchFirebase(userId, taskIdx, editId);
						if (success) {
							runInAction(() => {
								this.activeEdits.push(newEdit);
							});
						}
					} catch (error) {
						console.log(error);
					}
				}
				for (let editId of data.suggestedEdits) {
					const newEdit = new EditState(
						this.domainStore,
						this,
						null,
						true,
						this.trackId,
					);
					try {
						const success = await newEdit.fetchFirebase(userId, taskIdx, editId);
						if (success) {
							runInAction(() => {
								this.suggestedEdits.push(newEdit);
							});
						}
					} catch (error) {
						console.log(error);
					}
				}

				for (let bubbleId of data.systemBubbles) {
					const newBubble = new BubbleState(
						this.domainStore,
						this,
						this.trackId,
						0,
						this.domainStore.bubbleTypes.systemMessage,
						this.domainStore.processingModes.fromScratch,
						"",
					);
					try {
						const success = await newBubble.fetchFirebase(userId, taskIdx, bubbleId);
						if (success) {
							runInAction(() => {
								this.systemBubbles.push(newBubble);
							});
						}
					}
					catch (error) {
						console.log(error);
					}
				}

				for (let bubbleId of data.userBubbles) {
					const newBubble = new BubbleState(
						this.domainStore,
						this,
						this.trackId,
						0,
						this.domainStore.bubbleTypes.userCommand,
						this.domainStore.processingModes.fromScratch,
						"",
					);
					try {
						const success = await newBubble.fetchFirebase(userId, taskIdx, bubbleId);
						if (success) {
							runInAction(() => {
								this.userBubbles.push(newBubble);
							});
						}
					}
					catch (error) {
						console.log(error);
					}
				}
				resolve(true);
			})).catch((error) => {
				reject("domain fetch error: " + error.message);
			});
		});
	}
	
	tabStateConverter = {
		toFirestore: function(tab) {
			const data = {
				id: tab.id,
				idx: tab.idx,
				trackId: tab.trackId,
				title: tab.title,
				textCommand: tab.textCommand,
				sketchCommand: tab.sketchCommand,
				sketchPlayPosition: tab.sketchPlayPosition,
				systemBubbles: [],
				userBubbles: [],
				activeEdits: [],
				suggestedEdits: [],
				editOperationKey: tab.editOperationKey,
				suggestedEditOperationKeys: tab.suggestedEditOperationKeys,
				processingMode: tab.processingMode,
			};
	
			for (let edit of tab.activeEdits) {
				data.activeEdits.push(edit.commonState.id);
			}
			for (let edit of tab.suggestedEdits) {
				data.suggestedEdits.push(edit.commonState.id);
			}
			for (let bubble of tab.systemBubbles) {
				data.systemBubbles.push(bubble.id);
			}
			for (let bubble of tab.userBubbles) {
				data.userBubbles.push(bubble.id);
			}
			return data;
		},
		fromFirestore: function(snapshot, options) {
			const data = snapshot.data(options);
			return data;
		},
	};
}

export default TabState;