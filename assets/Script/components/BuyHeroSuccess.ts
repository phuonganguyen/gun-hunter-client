const { ccclass, property } = cc._decorator;

@ccclass
export default class BuyHeroSuccess extends cc.Component {
    @property(cc.Label)
    heroName: cc.Label = null;

    @property(cc.Sprite)
    hero: cc.Sprite = null;

    setData(data, heroName: string) {
        const self = this;
        this.heroName.string = heroName;
        cc.resources.load(`heroes/${data.hero_id}`, cc.SpriteFrame, function (err, spriteFrame: cc.SpriteFrame) {
            self.hero.spriteFrame = spriteFrame;
        });
    }
}
