import AccountManager from "./common/AccountManager";
import BuyHeroSuccess from "./components/BuyHeroSuccess";
import SnappedScrollView from "./controls/SnappedScrollView";
import BackendService, { Hero } from "./services/BackendService";

const { ccclass, property } = cc._decorator;

type OnChangedBet = (bet: string) => void;

@ccclass
export default class MarketPlace extends cc.Component {
    private selectedIndex = 0;
    private readonly displaySize = 3;
    private readonly backendService: BackendService;
    private readonly accountManager: AccountManager;

    constructor() {
        super();
        this.backendService = BackendService.getInstance();
        this.accountManager = AccountManager.getInstance();
    }

    @property(cc.Node)
    heros: cc.Node = null;

    @property(SnappedScrollView)
    snappedScrollView: SnappedScrollView = null;

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

    public onChanged: OnChangedBet = (bet) => {};

    private heroList: cc.Node[] = [];
    private selectedHero: Hero;

    onLoad() {
        this.loading.active = true;
        this.leftButton.active = false;
        this.heroList = [...this.heros.children];
        this.snappedScrollView.onScrollEnded = () => {
            const min = this.snappedScrollView.getMinDisplayIndex();

            if (this.selectedIndex < min) {
                this.selectedIndex = min;
                this.selectedIndex = Math.min(this.selectedIndex, this.heroList.length - this.displaySize);
            } else if (this.selectedIndex > min + this.displaySize - 1) {
                this.selectedIndex = min + this.displaySize - 1;
            }

            this.updateArrowVisibility();
            this.updateSelectedHeroValue();
        };
        this.setCurrentHero('1');
        this.loading.active = false;
    }

    onEnable() {
        this.selectedIndex = 0;
        this.snappedScrollView.scrollTo(0);
        this.scrollToSelectedIndex();
    }

    public init(onChanged: OnChangedBet) {
        this.onChanged = onChanged;
        this.setCurrentHero(this.heroList[0].toString());
    }

    public onPrevious() {
        this.loading.active = true;
        this.selectedIndex -= 1;
        this.scrollToSelectedIndex();
        this.loading.active = false;
    }

    public onNext() {
        this.loading.active = true;
        this.selectedIndex += 1;
        this.scrollToSelectedIndex();
        this.loading.active = false;
    }

    public onBack() {
        cc.director.loadScene('lobby');
    }

    private scrollToSelectedIndex() {
        this.updateArrowVisibility();

        const min = this.snappedScrollView.getMinDisplayIndex();
        if (this.selectedIndex <= min) {
            this.snappedScrollView.scrollTo(min > 0 ? min - 1 : 0);
        }
        if (this.selectedIndex >= min + this.displaySize - 1) {
            this.snappedScrollView.scrollTo(min + 1);
        }
        this.updateSelectedHeroValue();
    }

    private updateArrowVisibility() {
        this.leftButton.active = true;
        this.rightButton.active = true;
        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.leftButton.active = false;
        } else if (this.selectedIndex >= this.heroList.length - 1) {
            this.selectedIndex = this.heroList.length - 1;
            this.rightButton.active = false;
        }
    }

    updateSelectedHeroValue() {
        const item = this.heroList[this.selectedIndex].name;
        this.setCurrentHero(item);
    }

    private updateSelectedHero(targetName: string) {
        this.heros.children.forEach((hero) => {
            hero.stopAllActions();
            if (hero.name === targetName) {
                //hero.children[1].active = true;

                cc.tween(hero)
                    .to(0.2, {
                        scale: 1.15,
                        position: cc.v3(hero.position.x, 12),
                    })
                    .start();
            } else {
                //hero.children[1].active = false;

                cc.tween(hero)
                    .to(0.2, {
                        scale: 1,
                        position: cc.v3(hero.position.x, 0),
                    })
                    .start();
            }
        });
    }

    public onHeroClick(event) {
        this.loading.active = true;
        const hero = event.target.name;
        console.log(hero);

        let i = 0;
        for (; i < this.heroList.length; i++) {
            if (this.heroList[i].name === hero) {
                break;
            }
        }
        this.selectedIndex = i;
        this.scrollToSelectedIndex();
        this.loading.active = false;
    }

    async setCurrentHero(hero: string) {
        this.updateSelectedHero(hero);
        const heroInfo = await this.backendService.getHero(hero);
        this.selectedHero = heroInfo;
        console.log(this.selectedHero);
        this.heroName.string = heroInfo.name;
        this.heroPrice.string = heroInfo.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' GHT';
        heroInfo.percents.forEach((value, index) => {
            this.powers[index].string = value.toString();
        });
    }

    async onBuyHero() {
        this.loading.active = true;
        const txHash = await this.accountManager.transferCoin(this.selectedHero.price);
        const data = await this.backendService.buyHero(this.selectedHero.id, txHash);
        this.buyHeroSuccess.setData(data, this.selectedHero.name);
        this.loading.active = false;
        this.dialog.active = true;
    }

    closeDialog() {
        this.dialog.active = false;
    }
}
