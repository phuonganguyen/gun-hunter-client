// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroGun extends cc.Component {
    @property(cc.Animation)
    gunAnimation: cc.Animation = null;

    @property(cc.Animation)
    hitAnimation: cc.Animation = null;

    @property(cc.Animation)
    critical: cc.Animation = null;

    @property(cc.Animation)
    miss: cc.Animation = null;

    @property(cc.Animation)
    missText: cc.Animation = null;

    playGunAnimation() {
        this.gunAnimation.node.active = true;
        this.gunAnimation.play();
    }

    stopGunAnimation() {
        this.gunAnimation.stop();
        this.gunAnimation.node.active = false;
    }

    playHitAnimation() {
        this.hitAnimation.node.active = true;
        this.hitAnimation.play();
    }

    stopHitAnimation() {
        this.hitAnimation.stop();
        this.hitAnimation.node.active = false;
    }

    playMissAnimation() {
        this.miss.node.active = true;
        this.missText.node.active = true;
        this.miss.play();
        this.missText.play();
    }

    stopMissAnimation() {
        this.miss.stop();
        this.missText.stop();
        this.miss.node.active = false;
        this.missText.node.active = false;
    }

    playCriticalAnimation() {
        this.critical.node.active = true;
        this.critical.play();
    }

    stopCriticalAnimation() {
        this.critical.stop();
        this.critical.node.active = false;
    }

    stopAnimations() {
        this.stopGunAnimation();
        this.stopHitAnimation();
        this.stopCriticalAnimation();
        this.stopMissAnimation();
    }
}
