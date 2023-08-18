import { makeAutoObservable } from "mobx";
import CommonState from "./commonState";

class ShapeState {
	type = 0;

    constructor(domainStore, type, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, id, trackId);
        this.type = type;
    }

	setType(type) {
		this.type = type;
	}
}

export default ShapeState;
