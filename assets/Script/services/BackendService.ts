import axios from "axios";

interface AuthResponse {
    access_token: string;
    address: string;
    heroId: number;
    username: string;
    avatar_id: number;
}

export interface Hero {
    id: number;
    name: string;
    price: number;
    percents: number[];
}

export default class BackendService {
    private static instance: BackendService;
    private baseAPIUri = 'http://34.116.121.99:4000';

    public static getInstance() {
        if (!this.instance) {
            this.instance = new BackendService();
        }

        return this.instance;
    }

    async auth(address: string) {
        const data = { address };
        const response = await axios.post<AuthResponse>(`${this.baseAPIUri}/auth`, data);
        return response.data;
    }

    async getContract() {
        const response = await axios.get(`${this.baseAPIUri}/contracts`, this.buildHeaderRequest());

        return {
            coin: response.data.find((item) => item.contract_symbol === 'GHF'),
            nft: response.data.find((item) => item.contract_symbol === 'GHT'),
        };
    }

    async getHero(heroId: string) {
        const response = await axios.get<Hero>(`${this.baseAPIUri}/heroes/${heroId}`, this.buildHeaderRequest());

        return response.data;
    }

    async buyHero(heroId: number, txHash: string) {
        const response = await axios.post(
            `${this.baseAPIUri}/orders`,
            {
                hero_id: heroId,
                amount: 1,
                transaction_hash: txHash,
            },
            this.buildHeaderRequest()
        );

        return response.data;
    }

    async getOwnerRecords() {
        const response = await axios.get(`${this.baseAPIUri}/owner/records`, this.buildHeaderRequest());

        return response.data;
    }

    async getHeroes() {
        const response = await axios.get(`${this.baseAPIUri}/owner/heroes`, this.buildHeaderRequest());

        return response.data;
    }

    buildHeaderRequest() {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    }
}
