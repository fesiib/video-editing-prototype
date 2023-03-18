import { makeAutoObservable } from "mobx";
import CommonState from "./commonState";

class VideoState {
    source = "http://localhost:3000/flame.avi";

    constructor(domainStore, source, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.domainStore = domainStore;
        this.commonState = new CommonState(domainStore, id, trackId);
        this.source = source;
    }

    setSource(source) {
        this.source = source;
        this.commonState.processing = true;
    }
}

export default VideoState;
