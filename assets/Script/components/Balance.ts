import AccountManager from "../common/AccountManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Balance extends cc.Component {
    private readonly accountManager: AccountManager;
    private updateBalanceInterval: number;

    constructor() {
        super();
        this.accountManager = AccountManager.getInstance();
    }

    @property(cc.Label)
    coin: cc.Label = null;

    async onEnable() {
        await this.loadBalance();
        this.updateBalanceInterval = setInterval(async () => {
            await this.loadBalance();
        }, 60 * 1000);
    }

    onDisable() {
        this.updateBalanceInterval && clearInterval(this.updateBalanceInterval);
    }

    async loadBalance() {
        const balance = await this.accountManager.updateBalance();
        if (balance > 99999) {
            const value = balance.toString().substring(0, 5);
            this.coin.string = `${value}...`;
        } else {
            this.coin.string = `${balance}`;
        }
    }

    onDestroy() {
        this.updateBalanceInterval && clearInterval(this.updateBalanceInterval);
    }
}
