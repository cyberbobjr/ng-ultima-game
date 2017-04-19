import {Entity} from "../classes/entity";
import {Injectable} from "@angular/core";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {ScenegraphService} from "../services/scene-graph/scenegraph.service";
import {DescriptionsService} from "../services/informations/descriptions.service";
import {IPortal} from "../interfaces/IPortal";

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_E = "KeyE";

@Injectable()
export class KeyboardinputSystem {

    constructor(private _mapsService: MapsService,
                private _sceneService: ScenegraphService,
                private _descriptionService: DescriptionsService) {
    }

    processKeyboardInput(event: KeyboardEvent) {
        this._mapsService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("keycontrol") && entity.hasBehavior("movable")) {
                    this._processKeybordInputMovement(event, entity);
                }
            });
    }

    private _processKeybordInputMovement(event: KeyboardEvent, entity: Entity) {
        let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        switch (event.code) {
            case KEY_UP :
                movableBehavior.moveUp();
                break;
            case KEY_DOWN:
                movableBehavior.moveDown();
                break;
            case KEY_LEFT:
                movableBehavior.moveLeft();
                break;
            case KEY_RIGHT:
                movableBehavior.moveRight();
                break;
            case KEY_E:
                this._processEnter(entity, positionBehavior.position);
                break;
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
}
