import { Room } from "../libs/colyseus";
import HeroGun from "./components/HeroGun";
import RoomService from "./services/RoomService";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PlayToEarn extends cc.Component {
    @property(cc.Node)
    hero: cc.Node = null;

    @property(cc.Prefab)
    heros: cc.Prefab[] = [];

    private readonly roomService: RoomService;
    private room: Room;

    constructor() {
        super();
        this.roomService = RoomService.getInstance();
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.room = this.roomService.getRoom();
        const hero = this.room.state.hero;
        const heroNode = cc.instantiate(this.heros[hero.hero_id - 1]);
        const heroGun = heroNode.getComponent(HeroGun);
        heroGun.playAnimation();

        this.hero.addChild(heroNode);
    }

    start() {}

    // update (dt) {}
}
