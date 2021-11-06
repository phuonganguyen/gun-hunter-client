import AccountManager from "./common/AccountManager";
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

    public onChanged: OnChangedBet = (bet) => {};

    private heroList: cc.Node[] = [];
    private selectedHero: Hero;

    onLoad() {
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
        this.selectedIndex -= 1;
        this.scrollToSelectedIndex();
    }

    public onNext() {
        this.selectedIndex += 1;
        this.scrollToSelectedIndex();
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
        console.log('updateSelectedChipValue');
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
                        position: cc.v2(hero.position.x, 12),
                    })
                    .start();
            } else {
                //hero.children[1].active = false;

                cc.tween(hero)
                    .to(0.2, {
                        scale: 1,
                        position: cc.v2(hero.position.x, 0),
                    })
                    .start();
            }
        });
    }

    public onHeroClick(event) {
        console.log('onHeroClick');
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
    }

    async setCurrentHero(hero: string) {
        this.updateSelectedHero(hero);
        const heroInfo = await this.backendService.getHero(hero);
        this.selectedHero = heroInfo;
        console.log(this.selectedHero);
        this.heroName.string = heroInfo.name;
        this.heroPrice.string = heroInfo.price.toString();
        heroInfo.percents.forEach((value, index) => {
            this.powers[index].string = value.toString();
        });
    }

    async onBuyHero() {
        const txHash = await this.accountManager.transferCoin(this.selectedHero.price);
        await this.backendService.buyHero(this.selectedHero.id, txHash);
    }
}
