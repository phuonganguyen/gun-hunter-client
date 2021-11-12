// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuyHeroSuccess extends cc.Component {
    @property(cc.Label)
    heroName: cc.Label = null;

    @property(cc.Sprite)
    hero: cc.Sprite = null;

    setData(data) {
        const self = this;
        cc.resources.load(`heroes/${data.hero_id}`, cc.SpriteFrame, function (err, spriteFrame: cc.SpriteFrame) {
            self.hero.spriteFrame = spriteFrame;
        });
    }
}
