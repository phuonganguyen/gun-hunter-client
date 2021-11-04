import SnappedScrollView from "./controls/SnappedScrollView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MarketPlace extends cc.Component {
    private selectedIndex = 0;

    @property(cc.Node)
    heros: cc.Node = null;

    @property(SnappedScrollView)
    snappedScrollView: SnappedScrollView = null;

    @property(cc.Node)
    leftButton: cc.Node = null;

    @property(cc.Node)
    rightButton: cc.Node = null;

    private heroList: cc.Node[] = [];

    onLoad() {
        this.heroList = [...this.heros.children];
    }

    public onPrevious() {
        this.selectedIndex -= 1;
        this.scrollToSelectedIndex();
    }

    public onNext() {
        this.selectedIndex += 1;
        this.scrollToSelectedIndex();
    }

    public onBack() {
        cc.director.loadScene('lobby');
    }

    private scrollToSelectedIndex() {
        this.updateArrowVisibility();

        const min = this.snappedScrollView.getMinDisplayIndex();
        if (this.selectedIndex <= min) {
            this.snappedScrollView.scrollTo(min > 0 ? min - 1 : 0);
        }
        if (this.selectedIndex >= min + 4 - 1) {
            this.snappedScrollView.scrollTo(min + 1);
        }
        this.updateSelectedChipValue();
    }

    private updateArrowVisibility() {
        this.leftButton.active = true;
        this.rightButton.active = true;
        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.leftButton.active = false;
        } else if (this.selectedIndex >= this.heroList.length - 1) {
            this.selectedIndex = this.heroList.length - 1;
            this.rightButton.active = false;
        }
    }

    updateSelectedChipValue() {
        const item = this.heroList[this.selectedIndex].name;
        this.setCurrentHero(item);
    }

    setCurrentHero(hero: string) {}
}
