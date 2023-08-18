import { makeAutoObservable } from "mobx";
import CommonState from "./commonState";

class ImageState {
    source = "";

    constructor(domainStore, source, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, id, trackId);
        this.source = source;
    }

    
    setSource(source) {
        this.source = source;
    }
}

export default ImageState;
