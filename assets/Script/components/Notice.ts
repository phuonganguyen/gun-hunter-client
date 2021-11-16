const { ccclass, property } = cc._decorator;

export interface NoticeData {
    text: string;
    buttonText: string;
}

@ccclass
export default class Notice extends cc.Component {
    @property(cc.Sprite)
    popupNode: cc.Sprite = null;

    @property(cc.Label)
    message: cc.Label = null;

    @property(cc.Node)
    buttonNode: cc.Node = null;

    @property(cc.Label)
    buttonLabel: cc.Label = null;

    public handleClickButton: () => void;

    public handleClose: () => void;

    onEnable() {
        this.popupNode.node.opacity = 0;
        this.popupNode.node.scale = 0;
        this.popupNode.node.runAction(cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()), cc.fadeTo(0.5, 255)));
    }

    onDisable() {
        this.node.destroyAllChildren();
        this.node.destroy();
    }

    public init(data: NoticeData) {
        this.node.active = true;
        this.setMessage(data.text);
        this.setButton(data.buttonText);
    }

    public onClickButton() {
        if (this.handleClickButton) {
            this.handleClickButton();
        }

        this.close();
    }

    public close() {
        if (this.handleClose) {
            this.handleClose();
        }

        this.node.active = false;
    }

    public setMessage(message: string) {
        if (message) {
            this.message.string = message;
        }
    }

    public setButton(buttonText: string) {
        if (buttonText) {
            this.buttonLabel.string = buttonText;
            this.buttonNode.active = true;
        } else {
            this.buttonNode.active = false;
        }
    }
}
