import AccountManager from "./common/AccountManager";
import BuyHeroSuccess from "./components/BuyHeroSuccess";
import Notice from "./components/Notice";
import BackendService from "./services/BackendService";

const { ccclass, property } = cc._decorator;

type OnChangedBet = (bet: string) => void;

@ccclass
export default class MarketPlace extends cc.Component {
    private readonly backendService: BackendService;
    private readonly accountManager: AccountManager;

    constructor() {
        super();
        this.backendService = BackendService.getInstance();
        this.accountManager = AccountManager.getInstance();
    }

    @property(cc.Node)
    heros: cc.Node = null;

    @property(cc.Node)
    leftButton: cc.Node = null;

    @property(cc.Node)
    rightButton: cc.Node = null;

    @property(cc.Label)
    heroName: cc.Label = null;

    @property(cc.Label)
    heroPrice: cc.Label = null;

    @property([cc.Label])
    powers: cc.Label[] = [];

    @property(cc.Node)
    dialog: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(BuyHeroSuccess)
    buyHeroSuccess: BuyHeroSuccess = null;

    @property(cc.Prefab)
    heroAnimations: cc.Prefab[] = [];

    @property(cc.Node)
    notice: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    private heroList = [];
    private selectedHero = null;

    async onLoad() {
        this.loading.active = true;
        this.heroList = await this.backendService.getHeroes();
        this.selectedHero = this.heroList[1];
        this.loadHeroes();
        this.setCurrentHero();
        this.loading.active = false;
    }

    loadHeroes() {
        this.heros.children.forEach((node) => {
            node.children[0].destroyAllChildren();
            const hero = this.heroList[node.name];

            const heroNode = cc.instantiate(this.heroAnimations[hero.id - 1]);
            node.children[0].addChild(heroNode);
        });
    }

    public onPrevious() {
        this.loading.active = true;

        const hero = this.heroList.pop();
        this.heroList.unshift(hero);
        this.loadHeroes();
        this.setCurrentHero();

        this.loading.active = false;
    }

    public onNext() {
        this.loading.active = true;
        const hero = this.heroList.shift();
        this.heroList.push(hero);
        this.loadHeroes();
        this.setCurrentHero();
        this.loading.active = false;
    }

    public onBack() {
        cc.director.loadScene('lobby');
    }

    async setCurrentHero() {
        const currentHero = this.heroList[1];
        const heroInfo = await this.backendService.getHero(currentHero.id);
        this.selectedHero = heroInfo;
        this.heroName.string = heroInfo.name;
        this.heroPrice.string = heroInfo.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' GHT';
        heroInfo.percents.forEach((value, index) => {
            this.powers[index].string = value.toString();
        });
    }

    async onBuyHero() {
        if (this.accountManager.balance < this.selectedHero.price) {
            const noticeNode = cc.instantiate(this.noticePrefab);
            const noticeComponent = noticeNode.getComponent(Notice);
            noticeComponent.init({ text: 'Not enough GHT, please buy more.', buttonText: 'Buy Token' });
            this.notice.addChild(noticeNode);
        } else {
            this.loading.active = true;
            const txHash = await this.accountManager.transferCoin(this.selectedHero.price);
            const data = await this.backendService.buyHero(this.selectedHero.id, txHash);
            this.buyHeroSuccess.setData(data, this.selectedHero.name);
            this.loading.active = false;
            this.dialog.active = true;
        }
    }

    closeDialog() {
        this.dialog.active = false;
    }
}
