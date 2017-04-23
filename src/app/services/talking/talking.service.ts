import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Subject} from "rxjs/Subject";
import {TalkBehavior} from "../../behaviors/talk-behavior";
import {ITalkTexts} from "../../interfaces/INpc";
import * as _ from "lodash";

@Injectable()
export class TalkingService {
    talker$: Subject<Entity> = new Subject();
    private _talker: Entity = null;
    private _talkTo: Entity = null;
    private _npcTalks: ITalkTexts = null;

    constructor() {
        this.talker$.subscribe((talker: Entity) => {
            this._talker = talker;
            this._loadTalkTo();
        });
    }

    private _loadTalkTo() {
        let talkingBehavior: TalkBehavior = <TalkBehavior>this._talker.getBehavior("talk");
        this._talkTo = talkingBehavior.talker;
        let talkingToBehavior: TalkBehavior = <TalkBehavior>this._talkTo.getBehavior("talk");
        this._npcTalks = talkingToBehavior.talkTexts;
    }

    parseInputTalking(conversation: string): string {
        console.log(this._npcTalks);
        console.log(conversation);
        if (_.has(this._npcTalks, _.toLower(conversation))) {
            return this._npcTalks[conversation];
        } else {
            return "That I Cannot help thee with.";
        }
    }
}
