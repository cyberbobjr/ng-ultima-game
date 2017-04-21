import {IBehavior} from "../interfaces/IBehavior";
import {ITalk} from "../interfaces/INpc";
import {Entity} from "../classes/entity";

export class TalkBehavior implements IBehavior {
    name = "talk";
    private _talk: ITalk;
    private _talker: Entity;

    constructor(talk: ITalk) {
        this._talk = talk;
    }

    tick(PerformanceNow: number) {

    }

    set talker(entity: Entity) {
        this._talker = entity;
    }
}
