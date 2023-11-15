import { action, makeAutoObservable, toJS } from "mobx";

import CommonState from "./commonState";

import { randomUUID, roundNumber } from "../../utilities/genericUtilities";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import EditState from "./editState";

class Bubble extends EditState {
	toggle = false;
	time = 0;
	type = ""; // userCommand, parsingResult, edit, systemMessage

	constructor(domainStore, tab, trackId, time, type) {
		super(domainStore, tab, true, trackId);
		this.toggle = false;
		this.time = time;
		this.type = type;
	}

	setContent(content) {
		this.content = content;
	}

	get tab() {
		return this.intent;
	}

	get content() {
		return this.type;
	}
}