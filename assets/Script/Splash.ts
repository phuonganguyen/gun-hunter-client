const { ccclass, property } = cc._decorator;

@ccclass
export default class Splash extends cc.Component {
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar;

    @property(cc.Label)
    progressLabel: cc.Label;

    onLoad() {
        this.updateProgress(0);
        this.loadLobby();
    }

    loadLobby() {
        setTimeout(
            function () {
                cc.director.preloadScene('lobby', this.onProgress.bind(this), this.onLoaded.bind(this));
            }.bind(this),
            200
        );
    }

    onProgress(completedCount: number, totalCount) {
        const percent = completedCount / totalCount;
        this.updateProgress(percent);
    }

    onLoaded(err, asset) {
        cc.director.loadScene('lobby');
    }

    updateProgress(progress: number) {
        this.progressBar.progress = progress;
        this.progressLabel.string = `${Math.round(progress * 100)}%`;
    }

    // start() {}

    // update (dt) {}
}
