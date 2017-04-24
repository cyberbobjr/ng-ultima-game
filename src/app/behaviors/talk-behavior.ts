import {IBehavior} from "../interfaces/IBehavior";
import {ITalkTexts} from "../interfaces/INpc";
import {Entity} from "../classes/entity";
import * as _ from "lodash";

export class TalkBehavior implements IBehavior {
    name = "talk";
    private _talkTexts: ITalkTexts = null;
    private _talkTo: Entity = null;
    private _owner: Entity = null;

    constructor(owner: Entity, talk: ITalkTexts = null) {
        this._owner = owner;
        this._talkTexts = talk;
    }

    tick(PerformanceNow: number) {

    }

    // @TODO : replace with behavior properties
    set talkTo(entity: Entity) {
        this._talkTo = entity;
    }

    get talkTo() {
        return this._talkTo;
    }

    get description() {
        return `You meet ${this._talkTexts.look}`;
    }

    get greetings() {
        return `${this._talkTexts.pronoun} says : I am ${this._talkTexts.name}`;
    }

    parseQuestion(question: string): string {
        if (_.has(this._talkTexts, _.toLower(question))) {
            return this._talkTexts[question];
        } else {
            return "That I Cannot help thee with.";
        }
    }
}
