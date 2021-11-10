import Moralis from "../../libs/moralis.min.js";
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
    /* Moralis init code */
    private readonly serverUrl = 'https://kdlpb0cvts4u.usemoralis.com:2053/server';
    private readonly appId = 'sDLLuGfjkVhHPDq3LbVEi31FvVGnHxTfYKV6CSzo';

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
    private user;

    static utils;

    private tokenContract;

    private APPROVE_ADDRESS;
    private contract;

    public updateBalanceCallBack: (tokenBalance) => void;
    private onTransactionCallBack: (handle: HandleTransactionResponse) => void;
    private onFisnishTransactionCallBack: () => void;
    private roomTypes: RoomType[];

    setContract(contract) {
        this.contract = contract;
    }

    login() {
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

    getAddress(): string {
        return this.address;
    }

    isLogined(): boolean {
        return this.account !== null;
    }

    private initAccount() {
        console.log('initAccount');
        // Moralis.start({ serverUrl: this.serverUrl, appId: this.appId });
        // this.user = await Moralis.authenticate();
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

        //await this.initContract();
        await this.updateBalance();
        await this.getAllowance();

        this.isLoggedIn = true;
    }

    public async initContract(contract) {
        console.log('init contract');
        await this.web3.eth.net.getNetworkType();
        this.tokenContract = new this.web3.eth.Contract(contract.coin.contract_abi, contract.coin.contract_address);

        // return this.web3.eth.net.getNetworkType().then((netId) => {
        //     if (!this.tokenContract) {
        //         console.log(this.tokenContract);
        //     }
        // });
    }

    public async updateBalance() {
        if (!this.tokenContract) {
            return;
        }

        const balance = await this.getBalance(this.tokenContract);
        return balance / 1e9 || 0;
    }

    public async startUpdateBalance() {
        await this.updateBalance();
    }

    public setUpdateBalanceCallBack(f) {
        this.updateBalanceCallBack = f;
    }

    private getBalance(contract) {
        console.log(this.address);
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

    async transferCoin(coins) {
        console.log(this.contract);
        const coinContract = new this.web3.eth.Contract(this.contract.coin.contract_abi, this.contract.coin.contract_address);
        const rawData = coinContract.methods.transfer(this.contract.coin.owner_address, coins * 1e9).encodeABI();

        const transactionParameters = {
            gasPrice: this.web3.utils.toHex(Web3.utils.toWei('10', 'gwei')), // customizable by user during MetaMask confirmation.
            gas: this.web3.utils.toHex(70000), // customizable by user during MetaMask confirmation.
            to: this.contract.coin.contract_address, // Required except during contract publications.
            from: this.window.ethereum.selectedAddress, // must match user's active address.
            value: '0x00', // Only required to send ether to the recipient from the initiating external account.
            data: rawData, // Optional, but used for defining smart contract creation and interaction.
        };

        const txHash = await this.window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });

        return txHash;
    }

    async heroNFT() {
        const options = { chain: 'bsc testnet', address: this.user.get('ethAddress') };

        const userEthNFTs = await Moralis.Web3.getNFTs(options);

        const data = userEthNFTs.filter(
            (item) => item?.token_address?.toLowerCase() === this.contract.nft?.contract_address?.toLowerCase()
        );

        return data;
    }
}
