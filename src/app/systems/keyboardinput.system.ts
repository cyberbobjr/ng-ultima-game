import {EntitiesService} from "../services/entities/entities.service";
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

/**
 * m[tileType.village] = { entryPos: new Pos(1, 15), name: "village" };
 m[tileType.town] = { entryPos: new Pos(1, 15), name: "towne" };
 m[tileType.castle] =  m[tileType.LBCastleCenter] = { entryPos: new Pos(15, 30), name: "castle" };
 */

@Injectable()
export class KeyboardinputSystem {

    constructor(private _entities: EntitiesService,
                private _mapsService: MapsService,
                private _sceneService: ScenegraphService,
                private _descriptionService: DescriptionsService) {
    }

    processKeyboardInput(event: KeyboardEvent) {
        let entities: Array<Entity> = [];
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("keycontrol") && entity.hasBehavior("movable")) {
                this._processKeybordInputMovement(event, entity);
            }
        });
        return entities;
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
                this._processEnterLocation(entity, positionBehavior.position);
                break;
        }
    }

    private _processEnterLocation(entity: Entity, position: Position) {
        try {
            let portal: IPortal = this._mapsService.getPortalForPosition(position);
            let destMapId = parseInt(portal.destmapid,10);
            this._sceneService.enterInCity(entity, destMapId);
            let mapMetaData = <any>this._mapsService.getMapMetadataByMapId(destMapId);
            this._descriptionService.addTextToInformation(`Enter in ${mapMetaData.city.name}!`);
        } catch (error) {
            this._descriptionService.addTextToInformation("WHAT ???");
        }
    }
}
