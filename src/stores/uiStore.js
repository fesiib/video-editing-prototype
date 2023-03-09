import { makeAutoObservable } from "mobx";

const ZOOM_PERCENTAGES = [15, 25, 30, 50, 60, 70, 80, 100, 125, 150, 200];

class UIStore {
    // Session Info
    accountId = "test";
    projectId = "test";
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    canvasSize = {
        width: (window.innerWidth / 3) * 2, // 2/3
        height: (window.innerHeight / 3) * 2, // 2/3
    };
    canvasControls = {
        scalePos: 4,
    };
    canvasConst = {
        margin: 10,
    };

    timelineSize = {
        width: (window.innerWidth / 3) * 2, // 2/3
        height: window.innerWidth / 3, // 1/3
    };
    timelineControls = {
        numberOfRows: 3,
        pxPerSec: 10,
        playPosition: 0, //secs
    };
    timelineConst = {
        labelHeight: 20,
        linePadding: 1,

        positionIndicatorWidth: 8,
        labelIntervalPx: 100, //px

        trackMaxDuration: 60 * 20, //seconds
    };
    // panelSize = {};

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;
    }

    get canvasScale() {
        return ZOOM_PERCENTAGES[this.canvasControls.scalePos] / 100;
    }
    get canvasZoom() {
        return ZOOM_PERCENTAGES[this.canvasControls.scalePos];
    }

    get timelineSingleLineHeight() {
        return this.timelineSize.height / this.timelineControls.numberOfRows;
    }

    get trackWidthPx() {
        return this.timelineConst.trackMaxDuration * this.timelineControls.pxPerSec;
    }

    setWindowSize({ width, height }) {
        this.windowSize = { width, height };
        this.canvasSize = {
            width: (width / 3) * 2,
            height: (height / 3) * 2,
        };
        this.timelineSize = {
            width: (width / 3) * 2,
            height: height / 3,
        };
    }

    secToPx(seconds) {
        return seconds * this.timelineControls.pxPerSec;
    }

    pxToSec(px) {
        return Math.round((px / this.timelineControls.pxPerSec) * 100) / 100;
    }
}

export default UIStore;
