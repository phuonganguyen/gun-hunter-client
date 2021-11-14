import * as Colyseus from "../../libs/colyseus";

export default class RoomService {
    private static _instance: RoomService;

    private readonly client: Colyseus.Client;
    private readonly GAME_SERVER_URI = 'wss://gun-hunter-service.herokuapp.com/';
    private readonly ROOM_NAME = 'battle_room';

    private room: Colyseus.Room;

    constructor() {
        this.client = new Colyseus.Client(this.GAME_SERVER_URI);
    }

    static getInstance() {
        if (!this._instance) {
            this._instance = new RoomService();
        }

        return this._instance;
    }

    async joinRoom(heroId: number) {
        this.room = await this.client.joinOrCreate(this.ROOM_NAME);
    }
}
