import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {TalkBehavior} from "../../behaviors/talk-behavior";
import {AiMovementBehavior} from "../../behaviors/ai-movement-behavior";
import {DescriptionsService} from "../descriptions/descriptions.service";
import * as _ from "lodash";
import {Subject} from "rxjs/Subject";

@Injectable()
export class TalkingService {
    talker: Entity = null;
    talker$: Subject<Entity> = new Subject();
    private _entityToTalk: Entity = null;
    private _talkerToBehavior: TalkBehavior = null;

    constructor(private _descriptionService: DescriptionsService) {
    }

    startNewConversation(entity: Entity, entityToTalk: Entity) {
        this.talker$.next(entity);
        this.talker = entity;
        this._entityToTalk = entityToTalk;
        this._loadTalkWith(entity);
        this._stopAiMovementForEntityTalkTo();
        this._displayGreetings();
        this._subscribeToEndConversationFromEntity();
    }

    private _loadTalkWith(entity: Entity) {
        this._talkerToBehavior = <TalkBehavior>this._entityToTalk.getBehavior("talk");
        this._talkerToBehavior.talkTo = entity;
    }

    parseInputTalking(conversation: string): string | Array<string> {
        if (_.toLower(conversation) === "bye") {
            this.stopConversation();
            return this._talkerToBehavior.bye;
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

    stopConversation() {
        this._resumeAiMovementsForEntity(this._entityToTalk);
        this.talker = null;
        this.talker$.next(null);
        this._entityToTalk = null;
    }

    private _subscribeToEndConversationFromEntity() {
        this._talkerToBehavior.stopConversationFlag$.subscribe((stop: boolean) => {
            if (stop) {
                this.stopConversation();
            }
        });
    }
}
