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
        this.loadHero(this.selectedIndex);
    }

    loadHero(heroIndex: number) {
        this.hero.setData(this.heroes[heroIndex]);
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
}
