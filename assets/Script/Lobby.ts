import AccountManager from "./common/AccountManager";
import Balance from "./components/Balance";
import Hero from "./components/Hero";
import BackendService from "./services/BackendService";

declare global {
    interface Window {
        authData: any;
    }
}

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

    @property(Balance)
    balance: Balance = null;

    @property(cc.Node)
    noHero: cc.Node = null;

    @property(cc.Node)
    hero: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Node)
    signed: cc.Node = null;

    @property(cc.Node)
    login: cc.Node = null;

    async onLoad() {
        this.loading.active = true;
        if (this.accountManager.isLoggedIn) {
            await this.loadUserInfo();
        } else {
            this.signed.active = false;
            this.login.active = true;
        }

        this.loading.active = false;
    }

    marketPlace() {
        cc.director.loadScene('marketplace');
    }

    myWarriors() {
        cc.director.loadScene('warriors');
    }

    async onLoginClick() {
        this.loading.active = true;
        await this.accountManager.login();
        this.accountManager.signedInCallback = this.signedIn.bind(this);
    }

    private async signedIn() {
        const address = this.accountManager.getAddress();
        const authData = await this.backendService.auth(address);
        localStorage.setItem('token', authData.access_token);
        window.authData = authData;
        const contract = await this.backendService.getContract();
        this.accountManager.setContract(contract);
        await this.accountManager.initContract(contract);
        await this.loadUserInfo(true);
        this.loading.active = false;
    }

    async loadUserInfo(isRedirect: boolean = false) {
        const authData = window.authData;
        this.username.string = authData.username;
        this.loadAvatar(authData.avatar_id);

        await this.balance.loadBalance();
        const hero = await this.backendService.getOwnerRecords();
        if (hero) {
            this.noHero.active = false;
            this.hero.active = true;
            const heroComponent = this.hero.getComponent(Hero);
            heroComponent.setData(hero);
        } else {
            this.noHero.active = true;
            this.hero.active = false;
            isRedirect && cc.director.loadScene('marketplace');
        }
        this.signed.active = true;
        this.login.active = false;
    }

    loadAvatar(avatarId: number) {
        console.log(avatarId);
        const self = this;
        cc.resources.load(`avatars/avt${avatarId}`, cc.SpriteFrame, function (err, spriteFrame: cc.SpriteFrame) {
            self.avatar.spriteFrame = spriteFrame;
        });
    }

    onPlayToEarnClick() {
        cc.director.loadScene('playtoearn');
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
