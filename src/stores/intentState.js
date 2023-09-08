import { action, makeAutoObservable, runInAction, set, toJS } from "mobx";

import EditState from "./objects/editState";

import { randomUUID } from "../utilities/genericUtilities";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../services/firebase";

class IntentState {
	summary = "";
    textCommand = "";
	sketchCommand = [];
	sketchPlayPosition = -1;
	trackId = 0;
	activeEdits = [];
	editOperationKey = "";
	id = "";
	idx = 0;
	
	processingMode = "from-scratch"; // from-scratch, add-more, adjust-selected
	suggestedEdits = [];
	suggestedEditOperationKey = "";
	suggestedEditOperationKeys = [];

	history = [];

    constructor(domainStore, idx, textCommand, sketchCommand, sketchPlayPosition, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
		this.idx = idx;
		this.summary = ""
        this.textCommand = textCommand;
		this.sketchCommand = sketchCommand;
		this.sketchPlayPosition = sketchPlayPosition;
		this.editOperationKey = "";
		this.suggestedEditOperationKey = "";
		this.suggestedEditOperationKeys = [];
		this.activeEdits = [];
		this.suggestedEdits = [];
		this.id = `intent-${randomUUID()}`;
		this.trackId = trackId;
		this.processingMode = "from-scratch";
		this.history = [];
		this.enterHistory();
		this.historyPos = 0;
    }

	enterHistory() {
		const historyEntry = {
			summary: this.summary,
			textCommand: this.textCommand,
			sketchCommand: this.sketchCommand.slice(0),
			sketchPlayPosition: this.sketchPlayPosition,
			suggestedEdits: [],
			suggestedEditOperationKey: this.suggestedEditOperationKey,
			suggestedEditOperationKeys: this.suggestedEditOperationKeys.slice(0),
			processingMode: this.processingMode,
		};

		for (let edit of this.suggestedEdits) {
			historyEntry.suggestedEdits.push(edit.getDeepCopy());
		}
		this.history.push(historyEntry);
	}

	restoreHistory(historyEntryPos) {
		if (this.history.length === 0 || historyEntryPos < 0 || historyEntryPos >= this.history.length) {
			return;
		}
		if (this.historyPos === historyEntryPos) {
			return;
		}
		if (this.historyPos === this.history.length - 1) {
			this.history.splice(this.historyPos, 1);
			this.enterHistory();
		}
		this.historyPos = historyEntryPos;
		const historyEntry = {
			...this.history[historyEntryPos]
		};
		this.summary = historyEntry.summary;
		this.textCommand = historyEntry.textCommand;
		this.sketchCommand = historyEntry.sketchCommand.slice(0);
		this.sketchPlayPosition = historyEntry.sketchPlayPosition;
		this.suggestedEditOperationKey = historyEntry.suggestedEditOperationKey;
		this.suggestedEditOperationKeys = historyEntry.suggestedEditOperationKeys.slice(0);
		this.processingMode = historyEntry.processingMode;
		this.suggestedEdits = [];
		for (let edit of historyEntry.suggestedEdits) {
			this.suggestedEdits.push(edit.getDeepCopy());
		}
	}

	deleteHistory(historyEntryPos) {
		if (this.history.length === 0 || historyEntryPos < 0 || historyEntryPos >= this.history.length) {
			return;
		}
		this.history.splice(historyEntryPos, 1);
		if (this.historyPos === historyEntryPos) {
			this.restoreHistory(this.history.length - 1);
		}
	}

	clearHistory() {	
		this.history = [];
		this.enterHistory();
		this.historyPos = 0;
	}

	getDeepCopy() {
		let newIntent = new IntentState(
			this.domainStore,
			this.idx,
			this.textCommand,
			this.sketchCommand,
			this.sketchPlayPosition,
			this.trackId
		);
		newIntent.summary = this.summary;
		newIntent.editOperationKey = this.editOperationKey;
		newIntent.suggestedEditOperationKey = this.suggestedEditOperationKey;
		newIntent.suggestedEditOperationKeys = this.suggestedEditOperationKeys.slice(0);
		newIntent.activeEdits = this.activeEdits.slice(0).map((edit) => {
			const newEdit = edit.getDeepCopy();
			newEdit.intent = newIntent;
			return newEdit;
		});
		newIntent.suggestedEdits = this.suggestedEdits.slice(0).map((edit) => {
			const newEdit = edit.getDeepCopy();
			newEdit.intent = newIntent;
			return newEdit;
		});
		newIntent.processingMode = this.processingMode;

		//copy history
		newIntent.history = this.history.map((entry) => {
			const newEntry = {
				summary: entry.summary,
				textCommand: entry.textCommand,
				sketchCommand: entry.sketchCommand.slice(0),
				sketchPlayPosition: entry.sketchPlayPosition,
				suggestedEdits: [],
				suggestedEditOperationKey: entry.suggestedEditOperationKey,
				suggestedEditOperationKeys: entry.suggestedEditOperationKeys.slice(0),
				processingMode: entry.processingMode,
			};
			for (let edit of entry.suggestedEdits) {
				const newEdit = edit.getDeepCopy();
				newEdit.intent = newIntent;
				newEntry.suggestedEdits.push(newEdit);
			}
			return newEntry;
		});
		newIntent.historyPos = this.historyPos;
		return newIntent;
	}

	setTextCommand(textCommand) {
		this.textCommand = textCommand;
	}

	setSketchCommand(sketchCommand) {
		this.sketchCommand = sketchCommand;
	}

	setSketchPlayPosition(sketchPlayPosition) {
		this.sketchPlayPosition = sketchPlayPosition;
	}

	setProcessingMode(processingMode) {
		this.processingMode = processingMode;
	}

	setEditOperationKey(newKey) {
		this.domainStore.rootStore.resetTempState();
		if (this.suggestedEditOperationKeys.includes(newKey)) {
			this.suggestedEditOperationKeys = this.suggestedEditOperationKeys.filter((key) => key !== newKey);
		}
		if (newKey === this.suggestedEditOperationKey) {
			this.suggestedEditOperationKey = "";
		}
		if (newKey === "") {
			this.editOperationKey = "";
			return;
		}
		if (!this.domainStore.editOperations[newKey].supported) {
			return;
		}
		this.editOperationKey = newKey;
		//conversion between types should happen
	}

	addActiveEdit(first, second) {
		const start = Math.min(first, second);
		const finish = Math.max(first, second);
		let newEdit = new EditState(this.domainStore, this, false, this.trackId);
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish, 
			offset: start,
			z: this.intentPos + 1,
		});
		this.activeEdits.push(newEdit);
		//this.activeEdits.sort((a, b) => a.commonState.offset - b.commonState.offset);
		return this.activeEdits[this.activeEdits.length - 1];
	}

	addEditFromSuggested(suggestedEditId) {
		const suggestedEdit = this.suggestedEdits.find((edit) => edit.commonState.id === suggestedEditId);
		if (suggestedEdit === undefined) {
			return;
		}
		const newEdit = suggestedEdit.getDeepCopy();
		newEdit.isSuggested = false;
		let deleteIds = [];
		let newEdits = [newEdit];
		for (let edit of this.activeEdits) {
			const left = Math.max(edit.commonState.offset, newEdit.commonState.offset);
			const right = Math.min(edit.commonState.end, newEdit.commonState.end);
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
					//console.log(newEdit.commonState.offset, newEdit.commonState.end);
					//console.log(edit.commonState.offset, edit.commonState.end, editCopy.commonState.offset, editCopy.commonState.end);
				}
			}
		}
		this.deleteEdits(deleteIds);
		this.activeEdits.push(...newEdits);
		return newEdit;
	}

	addRandomEdit(suggested) {
		const maxEditDuration = 120;

		const edits = suggested ? this.suggestedEdits : this.activeEdits;

		let start = Math.floor(Math.random() * maxEditDuration);
		let maxDuration = maxEditDuration;
		while (true) {
			let within = false;
			for (let edit of edits) {
				if (edit.commonState.offset <= start && edit.commonState.end > start) {
					within = true;
					break
				}
				if (edit.commonState.offset > start) {
					maxDuration = Math.min(edit.commonState.offset - start, maxDuration);
				}
			}
			if (within === true) {
				start = Math.floor(Math.random() * maxEditDuration);
				maxDuration = maxEditDuration
				continue;
			}
			break;
		}
		maxDuration = Math.min(maxDuration, 30);
		let finish = start + Math.floor(Math.random() * maxDuration);

		let x1 = Math.floor(Math.random() * this.domainStore.projectMetadata.width);
		let y1 = Math.floor(Math.random() * this.domainStore.projectMetadata.height);
		let x2 = Math.floor(Math.random() * this.domainStore.projectMetadata.width);
		let y2 = Math.floor(Math.random() * this.domainStore.projectMetadata.height);
		let x = Math.min(x1, x2);
		let y = Math.min(y1, y2);
		let width = Math.abs(x1 - x2);
		let height = Math.abs(y1 - y2);
		let explanation = ["random edit", "random edit 2"];
		let suggestedParameters = {
			"text": ["cheburek"],
			"image": ["goal"],
			"shape": ["this!!"]
		};
		let suggestionSource = {
			spatial: ["goal", " 2", "something happening "],
			temporal: ["goal", " 2", "this!"],
			edit: [" 2", "whenever"],
			custom: ["lol", "kek", "whenever", " 2"],
		};


		let newEdit = new EditState(this.domainStore, this, suggested, this.trackId);
		newEdit.explanation = explanation;
		newEdit.suggestionSource = suggestionSource;
		
		newEdit.contribution = [{
			text: this.textCommand,
			type: [],
		}];
		for (let key in newEdit.suggestionSource) {
			for (let source of newEdit.suggestionSource[key]) {
				let newContribution = [];
				for (let single of newEdit.contribution) {
					const text = single.text;
					const type = single.type;
					if (type.includes(key) === true) {
						newContribution.push(single);
						continue;
					}
					if (text.includes(source)) {
						const parts = text.split(source);
						for (let part_idx = 0; part_idx < parts.length - 1; part_idx++) {
							let part = parts[part_idx];
							if (part_idx === 0) {
								part = part.trimEnd();
							}
							else {
								part = part.trim();
							}
							if (part !== "") {
								newContribution.push({
									text: part,
									type: type.slice(0),
								});
							}
							newContribution.push({
								text: source,
								type: [...type.slice(0), key],
							});
						}
						let lastPart = parts[parts.length - 1];
						if (lastPart !== "") {
							newContribution.push({
								text: lastPart.trimStart(),
								type: type.slice(0),
							});
						}
					}
					else {
						//console.log("could not find", source, "in", text);
						newContribution.push(single);
					}
				}
				newEdit.contribution = newContribution.slice(0);
			}
		}

		newEdit.suggestedParameters = suggestedParameters;
		newEdit.commonState.setMetadata({
			duration: this.domainStore.projectMetadata.duration,
			start: start,
			finish: finish,
			offset: start,
			x: x,
			y: y,
			width: width,
			height: height,
			z: this.intentPos + 1,
		});
		if (suggested) {
			this.suggestedEdits.push(newEdit);
			return this.suggestedEdits[this.suggestedEdits.length - 1];
		}
		this.activeEdits.push(newEdit);
		return this.activeEdits[this.activeEdits.length - 1];
	}

	deleteEdits(selectedIds) {
		this.activeEdits = this.activeEdits.filter((edit) => {
            const isSelected = selectedIds.includes(edit.commonState.id);
            return !isSelected;
        });
		this.suggestedEdits = this.suggestedEdits.filter((edit) => {
			const isSelected = selectedIds.includes(edit.commonState.id);
			return !isSelected;
		});
		this.domainStore.rootStore.uiStore.selectTimelineObjects(
			this.domainStore.rootStore.uiStore.timelineControls.selectedTimelineItems.filter((item) => {
				return !selectedIds.includes(item?.commonState?.id);
			})
		); 
	}

	getObjectById(id) {
		const fromActive = this.activeEdits.find((edit) => edit.commonState.id === id);
		const fromSuggested = this.suggestedEdits.find((edit) => edit.commonState.id === id);
		if (fromActive !== undefined) {
			return fromActive;
		}
		return fromSuggested;
	}

	getCanvasObjectById(id) {
		if (this.editOperationKey === "crop" || this.editOperationKey === "shape") {
			const realId = id.substring(3);
			return this.getObjectById(realId);
		}
		return this.getObjectById(id);
	}

	get selectedPeriods() {
		return [];
	}
	get selectedTranscript() {
		return [];
	}
	get selectedEditOperation() {
		return [];
	}
	get selectedRectangle() {
		return [];
	}

	get editOperation() {
		if (this.editOperationKey === "") {
			return null;
		}
		return this.domainStore.editOperations[this.editOperationKey];
	}

	get intentPos() {
		return this.domainStore.intents.findIndex((intent) => intent.id === this.id);
	}

	get activeObjectsVisibility() {
		const playPosition = this.domainStore.rootStore.uiStore.timelineControls.playPosition;
		let result = [];
		for (let edit of this.activeEdits) {
			result.push(edit.isVisible(playPosition));
		}
		return result;
	}

	get requestParameters() {
		return {
			processingMode: this.processingMode,
			hasText: this.textCommand !== "",
			hasSketch: this.sketchCommand.length > 0,
			text: this.textCommand,
			sketchRectangles: [...this.sketchCommand],
			sketchFrameTimestamp: this.sketchPlayPosition,
			editOperation: this.editOperationKey,
		}
	}

	saveFirebase(userId, taskIdx) {
		const intentCollection = collection(firestore, this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.intentCollection);
		const intentId = this.id;
		const intentDoc = doc(intentCollection, intentId).withConverter(this.intentStateConverter);
		return new Promise(async (resolve, reject) => {
			try {
				let allEditPromises = [];
				for (let edit of this.activeEdits) {
					allEditPromises.push(edit.saveFirebase(userId, taskIdx));
				}	
				for (let edit of this.suggestedEdits) {
					allEditPromises.push(edit.saveFirebase(userId, taskIdx));	
				}
				await Promise.all(allEditPromises);
			} catch (error) {
				reject("edit save error: " + error.message);
			}
			setDoc(intentDoc, this, {merge: false}).then(() => {
				resolve();
			}).catch((error) => {
				reject("intent save error: " + error);
			});
		});
	}

	fetchFirebase(userId, taskIdx, intentId) {
		const intentCollection = collection(firestore, this.domainStore.rootStore.collection, userId, this.domainStore.rootStore.intentCollection);
		const intentDoc = doc(intentCollection, intentId).withConverter(this.intentStateConverter);
		return new Promise((resolve, reject) => {
			getDoc(intentDoc).then(action(async (fetchedIntentState) => {
				const data = fetchedIntentState.exists() ? fetchedIntentState.data() : null;
				if (data === null || data.id === undefined) {
					resolve(false);
				}
				this.activeEdits = [];
				this.suggestedEdits = [];

				this.idx = data.idx;
				this.textCommand = data.textCommand;
				this.summary = data.summary;
				this.sketchCommand = data.sketchCommand;
				this.sketchPlayPosition = data.sketchPlayPosition;
				this.trackId = data.trackId;
				this.id = data.id;
				this.editOperationKey = data.editOperationKey;
				this.suggestedEditOperationKey = data.suggestedEditOperationKey;
				this.suggestedEditOperationKeys = data.suggestedEditOperationKeys;
				
				this.processingMode = data.processingMode;

				for (let editId of data.activeEdits) {
					const newEdit = new EditState(
						this.domainStore,
						this,
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

				this.history = [];
				for (let entry of data.history) {
					const newEntry = {
						summary: entry.summary,
						textCommand: entry.textCommand,
						sketchCommand: entry.sketchCommand.slice(0),
						sketchPlayPosition: entry.sketchPlayPosition,
						suggestedEdits: [],
						suggestedEditOperationKey: entry.suggestedEditOperationKey,
						suggestedEditOperationKeys: entry.suggestedEditOperationKeys.slice(0),
						processingMode: entry.processingMode,
					};
					for (let editId of entry.suggestedEdits) {
						const newEdit = new EditState(
							this.domainStore,
							this,
							true,
							this.trackId,
						);
						try {
							const success = await newEdit.fetchFirebase(userId, taskIdx, editId);
							if (success) {
								runInAction(() => {
									newEntry.suggestedEdits.push(newEdit);
								});
							}
						} catch (error) {
							console.log(error);
						}
					}
					runInAction(() => {
						this.history.push(newEntry);
					});
				}
				this.historyPos = this.history.length - 1;
				resolve(true);
			})).catch((error) => {
				reject("domain fetch error: " + error.message);
			});
		});
	}
	
	intentStateConverter = {
		toFirestore: function(intent) {
			const data = {
				textCommand: intent.textCommand,
				summary: intent.summary,
				sketchCommand: toJS(intent.sketchCommand.slice(0)),
				sketchPlayPosition: intent.sketchPlayPosition,
				trackId: intent.trackId,
				editOperationKey: intent.editOperationKey,
				suggestedEditOperationKey: intent.suggestedEditOperationKey,
				suggestedEditOperationKeys: intent.suggestedEditOperationKeys,
				activeEdits: [],
				suggestedEdits: [],
				id: intent.id,
				idx: intent.idx,
				processingMode: intent.processingMode,
				history: [],
				historyPos: intent.historyPos,
			};
	
			for (let edit of intent.activeEdits) {
				data.activeEdits.push(edit.commonState.id);
			}
			for (let edit of intent.suggestedEdits) {
				data.suggestedEdits.push(edit.commonState.id);
			}
			for (let entry of intent.history) {
				const newEntry = {
					summary: entry.summary,
					textCommand: entry.textCommand,
					sketchCommand: toJS(entry.sketchCommand.slice(0)),
					sketchPlayPosition: entry.sketchPlayPosition,
					suggestedEdits: [],
					suggestedEditOperationKey: entry.suggestedEditOperationKey,
					suggestedEditOperationKeys: entry.suggestedEditOperationKeys,
					processingMode: entry.processingMode,
				};
				for (let edit of entry.suggestedEdits) {
					newEntry.suggestedEdits.push(edit.commonState.id);
				}
				data.history.push(newEntry);
			}
			//console.log("intent to", data);
			return data;
		},
		fromFirestore: function(snapshot, options) {
			const data = snapshot.data(options);
			//console.log("intent from", data);
			return data;
		},
	};
	
}

export default IntentState;
