import {Entity, talkingState} from "../classes/entity";
import {Injectable} from "@angular/core";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {ScenegraphService} from "../services/scene-graph/scenegraph.service";
import {DescriptionsService} from "../services/descriptions/descriptions.service";
import {IPortal} from "../interfaces/IPortal";
import {EntitiesService} from "../services/entities/entities.service";
import {AiMovementBehavior} from "../behaviors/ai-movement-behavior";
import {TalkBehavior} from "../behaviors/talk-behavior";
import {TalkingService} from "../services/talking/talking.service";

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_E = "KeyE";
const KEY_T = "KeyT";
const KEY_ESC = "Escape";

@Injectable()
export class KeyboardinputSystem {

    constructor(private _mapsService: MapsService,
                private _sceneService: ScenegraphService,
                private _descriptionService: DescriptionsService,
                private _entitiesService: EntitiesService,
                private _talkingService: TalkingService) {
    }

    processKeyboardInput(event: KeyboardEvent) {
        this._mapsService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("keycontrol")) {
                    this._switchProcessKeyboardInput(event, entity);
                }
            });
    }

    private _switchProcessKeyboardInput(event: KeyboardEvent, entity: Entity) {
        switch (entity.talkingState) {
            case talkingState.none :
                this._processKeybordInputMovement(event, entity);
                break;
            case talkingState.askDirection :
                this._processKeyboardInputAskDirection(event, entity);
                break;
            case talkingState.talking :
                this._processKeyboardInputTalking(event, entity);
                break;
        }
    }

    private _processKeybordInputMovement(event: KeyboardEvent, entity: Entity) {
        let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
        let entityPosition: Position = this._getEntityPosition(entity);
        switch (event.code) {
            case KEY_UP :
            case KEY_DOWN:
            case KEY_LEFT:
            case KEY_RIGHT:
                movableBehavior.moveTo(this._getVectorDirectionForKey(event.code, entityPosition));
                break;
            case KEY_E:
                this._processEnter(entity, entityPosition);
                break;
            case KEY_T :
                this._askTalkingDirection(entity);
                break;
        }
    }

    private _processKeyboardInputAskDirection(event: KeyboardEvent, entity: Entity) {
        let entityPosition: Position = this._getEntityPosition(entity);
        switch (event.code) {
            case KEY_UP :
            case KEY_DOWN:
            case KEY_LEFT:
            case KEY_RIGHT:
                let vectorDirection: Position = this._getVectorDirectionForKey(event.code, entityPosition);
                let destinationPositionAsk: Position = entityPosition.addVector(vectorDirection);
                this._processAskTalkingToPosition(entity, destinationPositionAsk);
                break;
            default :
                this._descriptionService.addTextToInformation("You pass");
                this._stopConversation(entity);
                break;
        }
    }

    private _processKeyboardInputTalking(event: KeyboardEvent, entity: Entity) {
        switch (event.code) {
            case KEY_ESC :
                this._descriptionService.addTextToInformation("Bye");
                this._stopConversation(entity);
        }
    }

    private _processAskTalkingToPosition(entity: Entity, destinationPosition: Position) {
        let destEntity: Entity = this._entitiesService.getEntityAtPosition(destinationPosition);
        if (destEntity) {
            this._startConversationWithEntity(entity, destEntity);
        }
    }

    private _getEntityPosition(entity: Entity): Position {
        let positionBehavior: PositionBehavior = <PositionBehavior>entity.getBehavior("position");
        return positionBehavior.position;
    }

    private _getVectorDirectionForKey(keycode: string, destPosition: Position): Position {
        switch (keycode) {
            case KEY_UP :
                return destPosition.getVectorUp();
            case KEY_DOWN:
                return destPosition.getVectorDown();
            case KEY_LEFT:
                return destPosition.getVectorLeft();
            case KEY_RIGHT:
                return destPosition.getVectorRight();
        }
    }

    private _startConversationWithEntity(entity: Entity, entityToTalk: Entity) {
        if (this._canEntityTalk(entityToTalk)) {
            this._stopAiMovementForEntity(entityToTalk);
            let talkBehavior: TalkBehavior = <TalkBehavior>entity.getBehavior("talk");
            talkBehavior.talker = entityToTalk;
            entity.talkingState = talkingState.talking;
            this._talkingService.talker$.next(entity);
            this._displayGreetings(entityToTalk);
        } else {
            this._descriptionService.addTextToInformation("Funny, no response !");
            this._stopConversation(entity);
        }
    }

    private _stopConversation(entity: Entity) {
        entity.talkingState = talkingState.none;
    }

    private _stopAiMovementForEntity(entityToTalk: Entity) {
        let aiMovementBehavior: AiMovementBehavior = <AiMovementBehavior>entityToTalk.getBehavior("aimovement");
        if (aiMovementBehavior) {
            aiMovementBehavior.stopAiMovement();
        }
    }

    private _canEntityTalk(entity: Entity) {
        return entity.hasBehavior("talk");
    }

    private _displayGreetings(entityToTalk: Entity) {
        let talkBehavior: TalkBehavior = <TalkBehavior>entityToTalk.getBehavior("talk");
        console.log(entityToTalk);
        this._descriptionService.addTextToInformation(talkBehavior.description);
        this._descriptionService.addTextToInformation(talkBehavior.greetings);
    }

    private _processEnter(entity: Entity, position: Position) {
        try {
            let portal: IPortal = this._mapsService.getPortalForPosition(position);
            let destMapId = parseInt(portal.destmapid, 10);
            let portalInformation: IPortal = <IPortal>this._mapsService.getPortalInformationByPortalId(destMapId);
            let newPosition = new Position(parseInt(portalInformation.starty, 10), parseInt(portalInformation.startx, 10), destMapId);
            this._sceneService.setMapForEntity(entity, newPosition)
                .then(() => {
                    let mapMetaData = <any>this._mapsService.getMapMetadataByMapId(destMapId);
                    this._descriptionService.addTextToInformation(`Enter ${mapMetaData.city.name}!`);
                });
        } catch (error) {
            this._descriptionService.addTextToInformation("WHAT ???");
        }
    }

    private _askTalkingDirection(entity: Entity) {
        this._descriptionService.addTextToInformation("In wich direction ?");
        entity.talkingState = talkingState.askDirection;
    }
}
