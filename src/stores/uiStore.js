import { makeAutoObservable } from "mobx";

const ZOOM_PERCENTAGES = [
	15, 30, 50, 80, 100,
	125, 150, 200, 300, 400, 500
];

class UIStore {
    // Session Info
    accountId = "test";
    projectId = "test";
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    canvasSize = {
        width: window.innerWidth / 3 * 2,
        height: window.innerHeight / 3 * 2,
	};

	canvasControls = {
		zoom: 4,
	}
    // timelineSize = {};
    // panelSize = {};

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;
    }

	get zoomPercentage() {
		return ZOOM_PERCENTAGES[this.canvasControls.zoom];
	}

    setWindowSize({ width, height }) {
        this.windowSize = { width, height };
		this.canvasSize = {
			width: width / 3 * 2,
			height: height / 3 * 2,
		};
    }
}

export default UIStore;
