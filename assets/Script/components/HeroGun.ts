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

    playAnimation() {
        this.gunAnimation.node.active = true;
        this.gunAnimation.play();
    }

    stopAnimation() {
        this.gunAnimation.stop();
        this.gunAnimation.node.active = false;
    }
}
