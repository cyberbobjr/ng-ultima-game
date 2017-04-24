import {Injectable} from "@angular/core";
import {Entity, talkingState} from "../../classes/entity";
import {TalkBehavior} from "../../behaviors/talk-behavior";
import {AiMovementBehavior} from "../../behaviors/ai-movement-behavior";
import {DescriptionsService} from "../descriptions/descriptions.service";
import * as _ from "lodash";

@Injectable()
export class TalkingService {
    talker: Entity = null;
    private _entityToTalk: Entity = null;
    private _talkerToBehavior: TalkBehavior = null;

    constructor(private _descriptionService: DescriptionsService) {
    }

    startNewConversation(entity: Entity, entityToTalk: Entity) {
        this.talker = entity;
        this._entityToTalk = entityToTalk;
        entity.talkingState = talkingState.talking;
        this._loadTalkTo();
        this._stopAiMovementForEntityTalkTo();
        this._displayGreetings();
    }

    private _loadTalkTo() {
        this._talkerToBehavior = <TalkBehavior>this._entityToTalk.getBehavior("talk");
    }

    parseInputTalking(conversation: string): string|Array<string> {
        if (_.toLower(conversation) === "bye") {
            this._stopConversation();
            return "Bye";
        } else {
            return this._talkerToBehavior.parseInput(conversation);
        }
    }

    private _stopAiMovementForEntityTalkTo() {
        let aiMovementBehavior: AiMovementBehavior = <AiMovementBehavior>this._entityToTalk.getBehavior("aimovement");
        if (aiMovementBehavior) {
            aiMovementBehavior.stopAiMovement();
        }
    }

    private _resumeAiMovementsForEntity(entityToTalk: Entity) {
        let aiMovementBehavior: AiMovementBehavior = <AiMovementBehavior>entityToTalk.getBehavior("aimovement");
        if (aiMovementBehavior) {
            aiMovementBehavior.resumeAiMovement();
        }
    }

    private _displayGreetings() {
        let talkBehavior: TalkBehavior = <TalkBehavior>this._entityToTalk.getBehavior("talk");
        this._descriptionService.addTextToInformation(talkBehavior.description);
        this._descriptionService.addTextToInformation(talkBehavior.greetings);
    }

    private _stopConversation() {
        this.talker.talkingState = talkingState.none;
        this._resumeAiMovementsForEntity(this._entityToTalk);
        this.talker = null;
        this._entityToTalk = null;
    }

}
