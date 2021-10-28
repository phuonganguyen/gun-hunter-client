import AccountManager from "./common/AccountManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Lobby extends cc.Component {
    private readonly accountManager: AccountManager;

    constructor() {
        super();
        this.accountManager = AccountManager.getInstance();
    }

    @property(cc.Label)
    address: cc.Label = null;

    @property(cc.JsonAsset)
    contractABI: cc.JsonAsset = null;

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.accountManager.setJsonAbi(this.contractABI);
        this.accountManager.login();
        this.accountManager.signedInCallback = this.signedIn.bind(this);
    }

    private signedIn() {
        console.log(this.accountManager.getAddress());
        this.address.string = this.accountManager.getAddress();
    }

    startUpdateBalance() {
        AccountManager.getInstance().setUpdateBalanceCallBack((tokenBalance, gameBalance) => {
            this.updateBalance(tokenBalance, gameBalance);
        });
        //this.schedule(this.callUpdateBalance, this.TIME_TO_UPDATE_BALANCE);
    }

    updateBalance(tokenBalance, gameBalance) {
        // this.tokenBalance.string = Helper.roundNumber(parseFloat(tokenBalance), 4) + "";
        // this.gameBalance.string = Helper.roundNumber(parseFloat(gameBalance), 4) + "";
        // if (this.shopAllDialogClass) {
        //   this.shopAllDialogClass.updateBalance(tokenBalance, gameBalance);
        // }
    }

    // start() {}
    // update (dt) {}
}
