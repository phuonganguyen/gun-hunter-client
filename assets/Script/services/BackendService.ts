import axios from "axios";

interface AuthResponse {
    access_token: string;
    address: string;
    heroId: number;
    username: string;
    avatar_id: number;
}

interface Hero {
    id: number;
    name: string;
    price: number;
    percents: number[];
}

export default class BackendService {
    private static instance: BackendService;
    private baseAPIUri = 'http://34.116.121.99:30100';

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

    async getContracts() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${this.baseAPIUri}/contracts`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    }

    async getHero(heroId: string) {
        const token = localStorage.getItem('token');
        const response = await axios.get<Hero>(`${this.baseAPIUri}/heroes/${heroId}`, { headers: { Authorization: `Bearer ${token}` } });

        return response.data;
    }
}
