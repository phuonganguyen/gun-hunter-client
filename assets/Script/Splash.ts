const { ccclass, property } = cc._decorator;

@ccclass
export default class Splash extends cc.Component {
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property([cc.Node])
    dot: cc.Node[] = [];

    onLoad() {
        this.progressBar.progress = 0;
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
        this.progressBar.progress = percent;
    }

    onLoaded(err, asset) {
        cc.director.loadScene('lobby');
    }

    // start() {}

    // update (dt) {}
}
