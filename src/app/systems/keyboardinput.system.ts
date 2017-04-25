import {Entity} from "../classes/entity";
import {Injectable} from "@angular/core";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {ScenegraphService} from "../services/scene-graph/scenegraph.service";
import {DescriptionsService} from "../services/descriptions/descriptions.service";
import {IPortal} from "../interfaces/IPortal";
import {EntitiesService} from "../services/entities/entities.service";
import {TalkingService} from "../services/talking/talking.service";

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_E = "KeyE";
const KEY_O = "KeyO";
const KEY_T = "KeyT";
const KEY_ESC = "Escape";

@Injectable()
export class KeyboardinputSystem {
    private _cbKeyboardInputManager: (event: KeyboardEvent, entity: Entity) => void = this._cbProcessKeybordInputMovementManager;
    private _cbProcessAfterAskDirection: (entity: Entity, destPosition: Position) => void;

    constructor(private _mapsService: MapsService,
                private _sceneService: ScenegraphService,
                private _descriptionService: DescriptionsService,
                private _entitiesService: EntitiesService,
                private _talkingService: TalkingService) {

        this._talkingService.talker$.subscribe((talker: Entity) => {
            if (!talker) {
                this._setKeyboardInputManagerToDefault();
            }
        });
    }

    processKeyboardInput(event: KeyboardEvent) {
        this._mapsService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("keycontrol")) {
                    this._cbKeyboardInputManager(event, entity);
                }
            });
    }

    private _cbProcessKeybordInputMovementManager(event: KeyboardEvent, entity: Entity) {
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
            case KEY_O:
                this._askOpenDirection();
                break;
            case KEY_T :
                this._askTalkingDirection();
                break;
        }
    }

    private _cbProcessKeyboardInputAskDirectionManager(event: KeyboardEvent, entity: Entity) {
        switch (event.code) {
            case KEY_UP :
            case KEY_DOWN:
            case KEY_LEFT:
            case KEY_RIGHT:
                let entityPosition: Position = this._getEntityPosition(entity);
                let vectorDirection: Position = this._getVectorDirectionForKey(event.code, entityPosition);
                let destinationPositionAsk: Position = entityPosition.addVector(vectorDirection);
                this._cbProcessAfterAskDirection(entity, destinationPositionAsk);
                break;
            default :
                this._descriptionService.addTextToInformation("You pass");
                this._setKeyboardInputManagerToDefault();
                break;
        }
    }

    private _cbProcessKeyboardInputTalkingManager(event: KeyboardEvent, entity: Entity) {
        switch (event.code) {
            case KEY_ESC :
                this._talkingService.stopConversation();
                this._descriptionService.addTextToInformation("Bye");
        }
    }

    private _getEntityAtPosition(position: Position): Entity {
        let destEntity: Entity = this._entitiesService.getEntityAtPosition(position);
        if (!destEntity) {
            throw new Error("Funny, no response !");
        }
        return destEntity;
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
        if (!entityToTalk.canEntityTalk) {
            throw new Error("Funny, no response !");
        }
        this._talkingService.startNewConversation(entity, entityToTalk);
        this._cbKeyboardInputManager = this._cbProcessKeyboardInputTalkingManager;
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

    private _askTalkingDirection() {
        this._descriptionService.addTextToInformation("In wich direction ?");
        this._cbKeyboardInputManager = this._cbProcessKeyboardInputAskDirectionManager;
        this._cbProcessAfterAskDirection = this._processAfterAskTalkingToPosition;
    }

    private _askOpenDirection() {
        this._descriptionService.addTextToInformation("In wich direction ?");
        this._cbKeyboardInputManager = this._cbProcessKeyboardInputAskDirectionManager;
        this._cbProcessAfterAskDirection = this._processAfterAskOpenToPosition;
    }

    private _processAfterAskTalkingToPosition(entity: Entity, destinationPosition: Position) {
        try {
            let destEntity: Entity = this._getEntityAtPosition(destinationPosition);
            this._startConversationWithEntity(entity, destEntity);
        } catch (Error) {
            this._descriptionService.addTextToInformation(Error.message);
            this._setKeyboardInputManagerToDefault();
        }
    }

    private _processAfterAskOpenToPosition(entity: Entity, destinationPosition: Position) {
        this._descriptionService.addTextToInformation("ok done");
        this._setKeyboardInputManagerToDefault();
    }

    private _setKeyboardInputManagerToDefault() {
        this._cbKeyboardInputManager = this._cbProcessKeybordInputMovementManager;
    }
}
