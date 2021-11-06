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
        console.log(data);
        const response = await axios.post<AuthResponse>(`${this.baseAPIUri}/auth`, data);
        return response.data;
    }

    async getContract() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${this.baseAPIUri}/contracts`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data.find((item) => item.contract_symbol === 'GHF');
    }

    async getHero(heroId: string) {
        const token = localStorage.getItem('token');
        const response = await axios.get<Hero>(`${this.baseAPIUri}/heroes/${heroId}`, { headers: { Authorization: `Bearer ${token}` } });

        return response.data;
    }

    async buyHero(heroId: number, txHash: string) {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${this.baseAPIUri}/orders`,
            {
                hero_id: heroId,
                amount: 1,
                transaction_hash: txHash,
            },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        );

        console.log(response.data);

        return response.data;
    }
}
