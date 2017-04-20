import {IBehavior} from "../interfaces/IBehavior";
import {ITalk} from "../interfaces/INpc";

export class TalkBehavior implements IBehavior {
    name = "talk";
    private _talk: ITalk;

    constructor(talk: ITalk) {
        this._talk = talk;
    }

    tick(PerformanceNow: number) {

    }
}
