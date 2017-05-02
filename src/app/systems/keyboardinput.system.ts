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
import {TilesLoaderService} from "../services/tiles/tiles.service";

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_ENTER = "KeyE";
const KEY_OPEN = "KeyO";
const KEY_TALK = "KeyT";
const KEY_KLIMB = "KeyK";
const KEY_DESCEND = "KeyD";
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
        console.log(entityPosition);
        switch (event.code) {
            case KEY_UP :
            case KEY_DOWN:
            case KEY_LEFT:
            case KEY_RIGHT:
                movableBehavior.moveTo(this._getVectorDirectionForKey(event.code, entityPosition));
                break;
            case KEY_ENTER:
                this._processEnter(entity, entityPosition);
                break;
            case KEY_OPEN:
                this._askOpenDirection();
                break;
            case KEY_TALK :
                this._askTalkingDirection();
                break;
            case KEY_KLIMB:
                this._processAction(entity, entityPosition, "klimb");
                break;
            case KEY_DESCEND:
                this._processAction(entity, entityPosition, "descend");
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

    private _getTalkingEntityAtPosition(position: Position): Entity {
        let destEntity: Entity = this._entitiesService.getEntityAtPosition(position);
        if (!destEntity || !destEntity.canEntityTalk) {
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

    private _processEnter(entity: Entity, position: Position) {
        try {
            this._changeMapForEntity(entity, position)
                .then((portalInformation: IPortal) => {
                    let mapMetaData = <any>this._mapsService.getMapMetadataByMapId(parseInt(portalInformation.destmapid, 10));
                    this._descriptionService.addTextToInformation(`Enter ${mapMetaData.city.name}!`);
                });
        } catch (error) {
            this._descriptionService.addTextToInformation("WHAT ???");
        }
    }

    private _processAction(entity: Entity, position: Position, action: string) {
        try {

            this._changeMapForEntity(entity, position)
                .then((portalInformation: IPortal) => {
                    if (portalInformation.action === action) {
                        this._descriptionService.addTextToInformation(portalInformation.message!);
                    }
                });
        } catch (error) {
            this._descriptionService.addTextToInformation("WHAT ???");
        }
    }

    private _changeMapForEntity(entity: Entity, entityPosition: Position): Promise<IPortal> {
        let portal: IPortal = this._mapsService.getPortalForPosition(entityPosition);
        let destMapId = parseInt(portal.destmapid, 10);
        let destinationPosition = new Position(parseInt(portal.starty, 10), parseInt(portal.startx, 10), destMapId);
        return this._sceneService.setMapForEntity(entity, destinationPosition).then(() => {
            return portal;
        });
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
            let destEntity: Entity = this._getTalkingEntityAtPosition(destinationPosition);
            this._talkingService.startNewConversation(entity, destEntity);
            this._cbKeyboardInputManager = this._cbProcessKeyboardInputTalkingManager;
        } catch (Error) {
            this._descriptionService.addTextToInformation(Error.message);
            this._setKeyboardInputManagerToDefault();
        }
    }

    private _processAfterAskOpenToPosition(entity: Entity, destinationPosition: Position) {
        let message: string = "";
        if (this._mapsService.isTileAtPositionIsClosedDoor(destinationPosition)) {
            this._mapsService.openDoorAtPosition(destinationPosition);
            message = "Door open";
        } else {
            message = "No door!";
        }
        this._descriptionService.addTextToInformation(message);
        this._setKeyboardInputManagerToDefault();
    }

    private _setKeyboardInputManagerToDefault() {
        this._cbKeyboardInputManager = this._cbProcessKeybordInputMovementManager;
    }
}
