import { makeAutoObservable } from "mobx";
import CommonState from "./commonState";

class VideoState {
    source = "http://localhost:3000/flame.avi";
    script = [];
    highLabel = "None";
    lowLabel = "misc";

    // {text: "", start: ""} start is relative to video
    constructor(domainStore, source, id, trackId) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.commonState = new CommonState(domainStore, id, trackId);
        this.domainStore = domainStore;
        this.source = source;
        this.script = [];
    }

    setSource(source) {
        this.source = source;
        this.commonState.processing = true;
        this.script = [];
    }

    setScript(script) {
        this.script = script;
    }

    get adjustedScript() {
        const adjusted = [];
        for (let single of this.script) {
            const start = single.start - this.commonState.start + this.commonState.offset;
            const finish = single.finish - this.commonState.start + this.commonState.offset;
            adjusted.push({
                text: single.text,
                start: start,
                finish: finish,
                lowLabel: single.lowLabel,
                highLabel: single.highLabel,
            });
        }
        return adjusted;
    }
}

export default VideoState;
