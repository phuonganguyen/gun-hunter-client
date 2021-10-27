import AccountManager from "./common/AccountManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Lobby extends cc.Component {
    @property(cc.JsonAsset)
    tokenJsonAbi: cc.JsonAsset = null;

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        AccountManager.getInstance().login();
    }
    // start() {}
    // update (dt) {}
}
