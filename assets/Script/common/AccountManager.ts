import Web3 from "../../libs/web3.min.js";
import GameService from "./GameService";
import HandleTransactionResponse from "./HandleTransactionResponse";

// import GameService from "./GameService";
interface Account {
    address: string;
    name?: string;
    allowance_ether?: string;
    tokenBalance_ether?: string;
    gameBalance_ether?: string;
}

export interface RoomType {
    bet: string;
    name: string;
}

export default class AccountManager {
    public static getInstance(): AccountManager {
        if (!this.instance) {
            this.instance = new AccountManager();
        }

        return this.instance;
    }

    public isLoggedIn: boolean = false;
    public account: Account;
    public signedInCallback: () => void;
    public address: string;

    private window = window as any;
    private static instance: AccountManager;
    private web3;

    static utils;

    private tokenContract;

    private tokenJsonAbi: cc.JsonAsset;

    private readonly TOKEN_ADDRESS = '0x9b66f614f4a6aa2d4f8de1a0b7889bcf47b5238d';
    private APPROVE_ADDRESS;

    public updateBalanceCallBack: (tokenBalance, gameBalance) => void;
    private onTransactionCallBack: (handle: HandleTransactionResponse) => void;
    private onFisnishTransactionCallBack: () => void;
    private roomTypes: RoomType[];

    setJsonAbi(tokenJsonAbi: cc.JsonAsset) {
        this.tokenJsonAbi = tokenJsonAbi;
    }

    login() {
        this.initWeb3();
    }

    getAddress(): string {
        return this.address;
    }

    isLogined(): boolean {
        return this.account !== null;
    }

    private initWeb3() {
        const isWeb3Enabled = () => !!this.window.web3;
        if (isWeb3Enabled()) {
            this.web3 = new Web3();

            AccountManager.utils = this.web3.utils;

            //Request account access for modern dapp browsers
            if (this.window.ethereum) {
                this.web3.setProvider(this.window.ethereum);
                this.window.ethereum
                    .enable()
                    .then((accounts) => {
                        this.initAccount();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            //Request account access for legacy dapp browsers
            else if (this.window.web3) {
                this.web3.setProvider(this.window.web3.currentProvider);

                this.initAccount();
            }
        } else {
            console.log('YOU MUST ENABLE AND LOGIN INTO YOUR WALLET OR METAMASK ACCOUNTS!');
        }
    }

    private initAccount() {
        console.log('initAccount');
        this.web3.eth.getAccounts().then((accounts) => {
            if (accounts.length > 0) {
                this.address = accounts[0].toLowerCase();
                this.signedInCallback();
                GameService.getInstance().joinLobby(this.address, this.signedIn.bind(this));
            } else {
                console.log('YOU MUST ENABLE AND LOGIN INTO YOUR WALLET OR METAMASK ACCOUNTS!');
            }
        });
    }

    private async signedIn(data) {
        this.account = data;
        if (this.signedInCallback) {
            this.signedInCallback();
        }

        await this.initContract();
        await this.updateBalance();
        await this.getAllowance();

        this.isLoggedIn = true;
    }

    private initContract() {
        if (!this.tokenJsonAbi) {
            return;
        }
        console.log('init contract');
        return this.web3.eth.net.getNetworkType().then((netId) => {
            if (!this.tokenContract) {
                this.tokenContract = new this.web3.eth.Contract(this.tokenJsonAbi.json, this.TOKEN_ADDRESS);
            }
        });
    }

    public async updateBalance() {
        if (this.tokenContract) {
            return;
        }

        this.account.tokenBalance_ether = await this.getBalance(this.tokenContract).then((balance) => {
            return AccountManager.toEther(balance);
        });

        if (this.updateBalanceCallBack) {
            this.updateBalanceCallBack(this.account.tokenBalance_ether, this.account.gameBalance_ether);
        }
    }

    public async startUpdateBalance() {
        await this.updateBalance();
    }

    public setUpdateBalanceCallBack(f) {
        this.updateBalanceCallBack = f;
    }

    private getBalance(contract) {
        return contract.methods
            .balanceOf(this.address)
            .call()
            .catch((error) => {
                console.log(error);
            });
    }

    private getAllowance() {
        this.tokenContract.methods
            .allowance(this.address, this.APPROVE_ADDRESS)
            .call()
            .then((result) => {
                this.account.allowance_ether = AccountManager.toEther(result);
                console.log('allowance: ' + this.account.allowance_ether);
            })
            .catch((error: Error) => {
                console.error(error);
            });
    }
    private approve(): Promise<string> {
        return new Promise((resolve) => {
            this.tokenContract.methods
                .approve(this.APPROVE_ADDRESS, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
                .send({ from: this.address })
                .then((result) => {
                    resolve('APPROVED!');
                })
                .catch((error) => {
                    console.error(error);
                    resolve(error.message);
                });
        });
    }

    private checkBalance(currentBalanceEther, inputBalanceEther, fromName, toName) {
        if (Number.parseFloat(currentBalanceEther) < Number.parseFloat(inputBalanceEther)) {
            var handle = new HandleTransactionResponse();
            handle.init(false, fromName + ' BALANCE NOT ENOUGH TO TRANSFER');
            this.handleInfoMessage(handle);
            this.onFisnishTransactionCallBack();
            return false;
        }
        if (Number.parseFloat(this.account.allowance_ether) < Number.parseFloat(inputBalanceEther)) {
            var handle = new HandleTransactionResponse();
            handle.init(
                false,
                'FROM ' + fromName + ' TO ' + toName + '.' + '\nTHE APPROVED ALLOWANCE IS NOT ENOUGH TO TRANSFER. APPROVE MORE ALLOWANCE?'
            );
            handle.isShowNegativeButton = true;
            handle.positiveCallBack = async () => {
                console.log('on positive call back');
                var result = await this.approve();
                var handle = new HandleTransactionResponse();
                handle.init(false, result, 'INFORM');
                this.handleInfoMessage(handle);
                this.onFisnishTransactionCallBack();
            };
            handle.negativeCallBack = () => {
                console.log('on negative call back');
                this.onFisnishTransactionCallBack();
            };
            this.handleInfoMessage(handle);
            return false;
        }
        return true;
    }

    public static toEther(value): string {
        return AccountManager.utils.fromWei(value);
    }

    private static toWei(value) {
        return AccountManager.utils.toWei(value);
    }

    public addTransactionCallBack(onConfirmTransactionCallBack, onFinishTransactionCallBack) {
        this.onTransactionCallBack = onConfirmTransactionCallBack;
        this.onFisnishTransactionCallBack = onFinishTransactionCallBack;
    }

    handleInfoMessage(handle: HandleTransactionResponse) {
        if (!handle) {
            return;
        }
        this.onTransactionCallBack(handle);
    }
}
