import { Client, Room, RoomAvailable } from "../../libs/colyseus";

type LobbyChangeCallback = (rooms: RoomAvailable[]) => void;
type PlayerChangeCallback = (players: any) => void;
type Listener = (data: any) => void;

export default class GameService {
    public static getInstance(): GameService {
        if (!this.instance) {
            this.instance = new GameService();
        }

        return this.instance;
    }

    private static instance: GameService;
    private listeners = {};
    private room: Room;
    private availableRooms: RoomAvailable[] = [];

    private lobbyChangeCallbacks = {};
    private playerChangeCallbacks = {};

    getAvailableRooms(): RoomAvailable[] {
        return this.availableRooms;
    }

    getCurrentRoom() {
        return this.room;
    }

    addLobbyChangeCallback(key: string, callback: LobbyChangeCallback) {
        this.lobbyChangeCallbacks[key] = callback;
    }

    removeLobbyChangeCallback(key: string) {
        delete this.lobbyChangeCallbacks[key];
    }

    addPlayerChangeCallback(key: string, callback: PlayerChangeCallback) {
        this.playerChangeCallbacks[key] = callback;
    }

    removePlayerChangeCallback(key: string) {
        delete this.playerChangeCallbacks[key];
    }

    private onLobbyChange() {
        console.log('onLobbyChange ', this.availableRooms);
        Object.keys(this.lobbyChangeCallbacks).forEach((key) => this.lobbyChangeCallbacks[key](this.availableRooms));
    }

    private onPlayersChanged() {
        Object.keys(this.playerChangeCallbacks).forEach((key) => this.playerChangeCallbacks[key](this.room.state.players));
    }

    // async joinByRoomId(address: string, roomId: string, signedInCallback: (room: Room) => void) {
    //     const client = new Client(configs.gameServiceURL);
    //     const room = await client.joinById(roomId, { address });
    //     this.initEventForRoom(room);
    //     setTimeout(() => {
    //         signedInCallback(room);
    //     }, 1000);
    // }

    async joinLobby(address: string, signedInCallback: () => void) {
        console.log('joinLobby');
        const client = new Client('ws://34.126.171.88:31860');
        const lobby = await client.joinOrCreate('my_room', { address });
        signedInCallback();

        lobby.onMessage('rooms', (rooms) => {
            this.availableRooms = rooms;
            this.onLobbyChange();
        });

        lobby.onMessage('signedIn', (data) => {});

        lobby.onMessage('+', ([roomId, room]) => {
            const roomIndex = this.availableRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex !== -1) {
                this.availableRooms[roomIndex] = room;
            } else {
                this.availableRooms.push(room);
            }
            this.onLobbyChange();
        });

        lobby.onMessage('-', (roomId) => {
            this.availableRooms = this.availableRooms.filter((room) => room.roomId !== roomId);
            this.onLobbyChange();
        });
    }

    private initEventForRoom(room: Room) {
        this.room = room;
        console.log(room.sessionId, 'joined', room.name);
        room.onStateChange((state) => {
            console.log(room.name, 'has new state:', state);
        });

        room.onMessage('*', (type, message) => {
            console.log('message on ', type, message);
        });

        room.onError((code, message) => {
            console.warn("Couldn't join ", code, message, room.name);
        });

        room.onLeave((code) => {
            console.warn('Leave room code:', code);
            this.room = null;
        });

        room.state.players.onAdd = (player: any, playerId: string) => {
            console.log('onAdd', playerId, player.address);
            this.room.state.players.forEach((value, key) => {
                console.log('key =>', key);
                console.log('value =>', value);
            });
            this.onPlayersChanged();
        };
        room.state.players.onRemove = (player: any, playerId: string) => {
            console.log('onRemove', playerId, player.address);
            this.onPlayersChanged();
        };
    }

    // async joinRoomGame(opt: any, signedInCallback: () => void) {
    //     const client = new Client(configs.gameServiceURL);
    //     const room = await client.joinOrCreate(configs.gameRoom, opt);
    //     this.initEventForRoom(room);
    //     signedInCallback();
    // }

    addListener(name: string, listener: Listener): void {
        this.listeners[name] = listener;
    }

    removeListener(name: string) {
        delete this.listeners[name];
    }

    send(type: string | number, message?: any): void {
        this.room.send(type, message);
    }
}
