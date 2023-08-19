import { makeAutoObservable } from "mobx";

import CommonState from "./commonState";

import { randomUUID } from "../../utilities/genericUtilities";

/*

on top of the frame
- Adding Text
- Adding Image
- Adding Shape (rectangle, circle, star)

change the video properties
- Cut/Trim
- Zoom
- Crop
- Blur
(- Adding Frames)
*/

class EditState {
	adjustedObjects = []; //id of the element & adjusted object
	excludedIds = [];
	editOperation = "";

    constructor(domainStore, title, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, this, "edit-" + randomUUID(), trackId);
		this.adjustedObjects = [];
		this.excludedIds = [];
		this.title = title;
    }

}

export default EditState;
