import axios from "axios";

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
        const response = await axios.post(`${this.baseAPIUri}/auth`, data);
        return response.data;
    }

    async getContracts() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${this.baseAPIUri}/contracts`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    }
}
