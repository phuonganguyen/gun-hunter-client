import * as Colyseus from "../libs/colyseus";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PlayToEarn extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        const client = new Colyseus.Client('wss://gun-hunter-service.herokuapp.com/');
        client
            .joinOrCreate('battle_room')
            .then((room) => {
                console.log(room.sessionId, 'joined', room.name);
            })
            .catch((e) => {
                console.log('JOIN ERROR', e);
            });
    }

    start() {}

    // update (dt) {}
}
