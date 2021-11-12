import AccountManager from "./common/AccountManager";
import NumberHelper from "./common/helpers/NumberHelper";
import Hero from "./components/Hero";
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

    @property(cc.Sprite)
    avatar: cc.Sprite = null;

    @property(cc.Label)
    username: cc.Label = null;

    @property(cc.Label)
    balance: cc.Label = null;

    @property(cc.Node)
    noHero: cc.Node = null;

    @property(cc.Node)
    hero: cc.Node = null;

    onLoad() {
        this.accountManager.login();
        this.accountManager.signedInCallback = this.signedIn.bind(this);
    }

    marketPlace() {
        cc.director.loadScene('marketplace');
    }

    myWarriors() {
        cc.director.loadScene('warriors');
    }

    private async signedIn() {
        const address = this.accountManager.getAddress();
        const authData = await this.backendService.auth(address);
        console.log(authData);
        this.username.string = authData.username;
        this.loadAvatar(authData.avatar_id);
        localStorage.setItem('token', authData.access_token);
        const contract = await this.backendService.getContract();
        this.accountManager.setContract(contract);
        await this.accountManager.initContract(contract);
        const balance = await this.accountManager.updateBalance();
        this.balance.string = NumberHelper.roundNumber(parseFloat(balance), 4) + '';
        const hero = await this.backendService.getOwnerRecords();
        if (hero) {
            this.noHero.active = false;
            this.hero.active = true;
            const heroComponent = this.hero.getComponent(Hero);
            heroComponent.setData(hero);
        } else {
            this.noHero.active = true;
            this.hero.active = false;
        }
    }

    loadAvatar(avatarId: number) {
        console.log(avatarId);
        const self = this;
        cc.resources.load(`avatars/avt${avatarId}`, cc.SpriteFrame, function (err, spriteFrame: cc.SpriteFrame) {
            self.avatar.spriteFrame = spriteFrame;
        });
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
