import Hero from "./components/Hero";
import BackendService from "./services/BackendService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Warriors extends cc.Component {
    private readonly backendService: BackendService;

    private selectedIndex = 0;
    private heroes = [];

    @property(Hero)
    hero: Hero = null;

    constructor() {
        super();
        this.backendService = BackendService.getInstance();
    }

    async onLoad() {
        this.heroes = await this.backendService.getHeroes();
        this.loadHero();
    }

    loadHero() {
        this.hero.setData(this.heroes[this.selectedIndex]);
    }

    next() {
        this.selectedIndex++;
        this.loadHero();
    }

    prev() {
        this.selectedIndex--;
        this.loadHero();
    }

    back() {
        cc.director.loadScene('lobby');
    }
}
