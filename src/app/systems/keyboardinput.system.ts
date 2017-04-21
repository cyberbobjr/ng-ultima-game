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

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_E = "KeyE";
const KEY_T = "KeyT";

@Injectable()
export class KeyboardinputSystem {

    constructor(private _mapsService: MapsService,
                private _sceneService: ScenegraphService,
                private _descriptionService: DescriptionsService,
                private _entitiesService: EntitiesService) {
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
                entity.talkingState = talkingState.none;
                break;
        }
    }

    private _processKeyboardInputTalking(event: KeyboardEvent, entity: Entity) {
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

    private _processAskTalkingToPosition(entity: Entity, destinationPosition: Position) {
        console.log(destinationPosition);
        let destEntity: Entity = this._entitiesService.getEntityAtPosition(destinationPosition);
        if (destEntity) {
            console.log(destEntity);
        }
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
