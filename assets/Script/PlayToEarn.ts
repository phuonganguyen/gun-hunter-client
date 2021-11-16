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

    @property(HeroGun)
    boss: HeroGun = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    @property(cc.Node)
    winNode: cc.Node = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Sprite)
    ghost: cc.Sprite = null;

    @property(cc.SpriteFrame)
    ghosts: cc.SpriteFrame[] = [];

    private readonly roomService: RoomService;
    private room: Room;
    private heroGunComponent: HeroGun;
    private BOSS_TURN_TYPE = 'BOSS_TURN_TYPE';
    private HERO_TURN_TYPE = 'HERO_TURN_TYPE';

    constructor() {
        super();
        this.roomService = RoomService.getInstance();
    }

    onLoad() {
        this.room = this.roomService.getRoom();
        this.initHero(this.room.state.hero);
        this.registerRoomEvent();
        setTimeout(() => {
            this.sendBattle(this.HERO_TURN_TYPE);
        }, 5 * 1000);
    }

    registerRoomEvent() {
        this.room.onMessage('battle', (message) => {
            console.log(message);
            const { type, attack_result } = message;
            switch (type) {
                case this.HERO_TURN_TYPE:
                    this.playHeroAttackResult(attack_result);
                case this.BOSS_TURN_TYPE:
                    this.playBossAttackResult(attack_result);
            }
        });
        this.room.onMessage('finish', (message) => {
            console.log('finish');
            console.log(message);
            const { battle_result } = message;
            this.stopGame(battle_result);
        });
        this.room.onError((code, message) => {
            console.log('oops, error ocurred:');
            console.log(message);
        });
    }

    playHeroAttackResult(attackResult) {
        cc.tween(this.heroGunComponent.node)
            .call(() => {
                switch (attackResult) {
                    case 0:
                        this.heroGunComponent.playMissAnimation();
                    case 1:
                        this.heroGunComponent.playHitAnimation();
                    case 2:
                        this.heroGunComponent.playCriticalAnimation();
                }
            })
            .delay(0.5)
            .call(() => {
                this.heroGunComponent.stopAnimations();
                this.sendBattle(this.BOSS_TURN_TYPE);
            })
            .start();
    }

    playBossAttackResult(attackResult: number) {
        cc.tween(this.boss.node)
            .call(() => {
                switch (attackResult) {
                    case 0:
                        this.boss.playMissAnimation();
                    case 1:
                        this.boss.playHitAnimation();
                    case 2:
                        this.boss.playCriticalAnimation();
                }
            })
            .delay(5)
            .call(() => {
                this.boss.stopAnimations();
                this.sendBattle(this.HERO_TURN_TYPE);
            })
            .start();
    }

    initHero(hero) {
        const heroNode = cc.instantiate(this.heros[hero.hero_id - 1]);
        this.heroGunComponent = heroNode.getComponent(HeroGun);
        this.hero.addChild(heroNode);
    }

    sendBattle(type: string) {
        console.log('sendBattle');
        switch (type) {
            case this.HERO_TURN_TYPE:
                cc.tween(this.heroGunComponent.node)
                    .call(() => {
                        this.heroGunComponent.playGunAnimation();
                    })
                    .delay(0.5)
                    .call(() => {
                        this.heroGunComponent.stopGunAnimation();
                        this.room.send('battle', { type });
                    })
                    .start();
            case this.BOSS_TURN_TYPE:
                cc.tween(this.boss.node)
                    .call(() => {
                        this.boss.playGunAnimation();
                    })
                    .delay(0.15)
                    .call(() => {
                        this.boss.stopGunAnimation();
                        this.room.send('battle', { type });
                    })
                    .start();
        }
    }

    stopGame(result) {
        this.heroGunComponent.stopGunAnimation();
        this.heroGunComponent.stopAnimations();
        this.boss.stopGunAnimation();
        this.boss.stopAnimations();
        this.dialog.active = true;
        if (result === 1) {
            this.winNode.active = true;
        } else {
            this.ghost.spriteFrame = this.ghosts[this.room.state.hero.hero_id - 1];
            this.closeNode.active = true;
        }
    }

    onDestroy() {
        this.room.leave();
    }

    back() {
        cc.director.loadScene('warriors');
    }
}
