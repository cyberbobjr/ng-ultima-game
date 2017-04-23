import {IBehavior} from "../interfaces/IBehavior";
import {ITalkTexts} from "../interfaces/INpc";
import {Entity} from "../classes/entity";

export class TalkBehavior implements IBehavior {
    name = "talk";
    private _talkTexts: ITalkTexts = null;
    private _talkTo: Entity = null;

    constructor(talk: ITalkTexts = null) {
        this._talkTexts = talk;
    }

    tick(PerformanceNow: number) {

    }

    // @TODO : replace with behavior properties
    set talker(entity: Entity) {
        this._talkTo = entity;
    }

    get talker() {
        return this._talkTo;
    }

    get talkTexts() {
        return this._talkTexts;
    }

    get description() {
        return `You meet ${this._talkTexts.look}`;
    }

    get greetings() {
        return `${this._talkTexts.pronoun} says : I am ${this._talkTexts.name}`;
    }
}
