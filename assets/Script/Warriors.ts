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

    @property(cc.Label)
    timeToTurn: cc.Label = null;

    @property(cc.Node)
    noHero: cc.Node = null;

    @property(cc.Node)
    hero: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Node)
    btnNext: cc.Node = null;

    @property(cc.Node)
    btnPrev: cc.Node = null;

    private countDown: number;

    constructor() {
        super();
        this.backendService = BackendService.getInstance();
    }

    async onLoad() {
        this.btnPrev.active = false;
        this.loading.active = true;
        this.heroes = await this.backendService.getOwnerHeroes();
        if (this.heroes && this.heroes.length) {
            this.loadHero(this.selectedIndex);
        } else {
            this.noHero.active = true;
            this.btnNext.active = false;
        }
        this.loading.active = false;
    }

    onPlayToEarnClick() {
        cc.director.loadScene('playtoearn');
    }

    loadHero(heroIndex: number) {
        const data = this.heroes[heroIndex];
        const hero = this.hero.getComponent(Hero);
        hero.setData(data);
        this.nft_id.string = `ID: ${data.nft_id}`;
        this.turn.string = `${data.used_turn}/${data.total_turn}`;
        const countDownDate = data.last_turn + 3600000;
        this.countDown && clearInterval(this.countDown);
        this.countDown = setInterval(() => {
            var now = new Date().getTime();
            var distance = countDownDate - now;
            if (distance > 0) {
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                this.timeToTurn.string = `${hours}:${minutes}:${seconds}`;
            } else {
                this.timeToTurn.string = `00:00:00`;
            }
        }, 1000);

        this.hero.active = true;
    }

    next() {
        this.loading.active = true;
        this.selectedIndex++;
        this.loadHero(this.selectedIndex);
        this.btnNext.active = this.selectedIndex !== this.heroes.length - 1;
        this.btnPrev.active = this.selectedIndex !== 0;
        this.loading.active = false;
    }

    prev() {
        this.loading.active = true;
        this.selectedIndex--;
        this.loadHero(this.selectedIndex);
        this.btnNext.active = this.selectedIndex !== this.heroes.length - 1;
        this.btnPrev.active = this.selectedIndex !== 0;
        this.loading.active = false;
    }

    back() {
        cc.director.loadScene('lobby');
    }

    goToMarket() {
        cc.director.loadScene('marketplace');
    }

    onDestroy() {
        this.countDown && clearInterval(this.countDown);
    }
}
