const { ccclass, property } = cc._decorator;

@ccclass
export default class Hero extends cc.Component {
    @property(cc.Label)
    heroName: cc.Label = null;

    @property(cc.Label)
    power: cc.Label = null;

    @property(cc.Label)
    vitality: cc.Label = null;

    @property(cc.Label)
    defense: cc.Label = null;

    @property(cc.Label)
    like: cc.Label = null;

    @property(cc.Label)
    battle: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property(cc.Node)
    hero: cc.Node = null;

    setData(data) {
        this.heroName.string = data.name;
        this.battle.string = data.battle;
        this.like.string = data.likes;
        this.win.string = `${(parseInt(data.win) * 100) / parseInt(data.battle)}%`;
        this.power.string = data.percents[0];
        this.vitality.string = data.percents[1];
        this.defense.string = data.percents[2];
        this.hero.children.forEach((node) => {
            if (node.name == data.id) {
                node.active = true;
            } else {
                node.active = false;
            }
        });
    }
}
