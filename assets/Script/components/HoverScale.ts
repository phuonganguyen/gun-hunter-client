const { ccclass, property } = cc._decorator;

@ccclass
export default class HoverScale extends cc.Component {
    @property
    pressedScale = 1;

    @property
    transDuration = 0;

    private initScale: number;

    onLoad() {
        this.initScale = this.node.scale;
    }

    onEnable() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.eventOnHover, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.eventOffHover, this);
    }
    onDisable() {
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.eventOnHover, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.eventOffHover, this);
    }

    eventOnHover(e) {
        this.node.stopAllActions();
        this.node.runAction(cc.scaleTo(this.transDuration, this.pressedScale));
    }

    eventOffHover(e) {
        this.node.stopAllActions();
        this.node.runAction(cc.scaleTo(this.transDuration, this.initScale));
    }
}
