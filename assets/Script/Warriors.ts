import Hero from "./components/Hero";
import BackendService from "./services/BackendService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Warriors extends cc.Component {
    private readonly backendService: BackendService;

    private selectedIndex = 0;
    private heroes = [];

    @property(cc.Label)
    nft_id: cc.Label = null;

    @property(cc.Label)
    turn: cc.Label = null;

    @property(cc.Node)
    noHero: cc.Node = null;

    @property(cc.Node)
    hero: cc.Node = null;

    constructor() {
        super();
        this.backendService = BackendService.getInstance();
    }

    async onLoad() {
        this.heroes = await this.backendService.getHeroes();
        if (this.heroes && this.heroes.length) {
            this.loadHero(this.selectedIndex);
        } else {
            this.noHero.active = true;
        }
    }

    loadHero(heroIndex: number) {
        const data = this.heroes[heroIndex];
        const hero = this.hero.getComponent(Hero);
        hero.setData(data);
        this.nft_id.string = `${data.nft_id}`;
        this.turn.string = `${data.total_turn - data.used_turn}/${data.total_turn}`;
        this.hero.active = true;
    }

    next() {
        if (this.selectedIndex === this.heroes.length - 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex++;
        }

        this.loadHero(this.selectedIndex);
    }

    prev() {
        if (this.selectedIndex === 0) {
            this.selectedIndex = this.heroes.length - 1;
        } else {
            this.selectedIndex--;
        }
        this.loadHero(this.selectedIndex);
    }

    back() {
        cc.director.loadScene('lobby');
    }

    goToMarket() {
        cc.director.loadScene('marketplace');
    }
}
