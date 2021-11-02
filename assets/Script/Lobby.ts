import AccountManager from "./common/AccountManager";
import BackendService from "./services/BackendService";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Lobby extends cc.Component {
    private readonly accountManager: AccountManager;
    private readonly backendService: BackendService;

    constructor() {
        super();
        this.accountManager = AccountManager.getInstance();
        this.backendService = BackendService.getInstance();
    }

    @property(cc.Label)
    address: cc.Label = null;

    @property(cc.JsonAsset)
    contractABI: cc.JsonAsset = null;

    onLoad() {
        this.accountManager.setJsonAbi(this.contractABI);
        this.accountManager.login();
        this.accountManager.signedInCallback = this.signedIn.bind(this);
    }

    private async signedIn() {
        const address = this.accountManager.getAddress();
        console.log(address);
        this.address.string = address;
        const authData = await this.backendService.auth(address);
        console.log(authData);
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
