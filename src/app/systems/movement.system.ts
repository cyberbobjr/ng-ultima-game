import {Injectable} from "@angular/core";
import {EntitiesService} from "../services/entities/entities.service";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {DescriptionsService} from "../services/informations/descriptions.service";
import {IMap} from "../interfaces/IMap";
import {ScenegraphService} from "../services/scene-graph/scenegraph.service";
import * as _ from "lodash";

@Injectable()
export class MovementSystem {
    constructor(private _entities: EntitiesService,
                private _mapService: MapsService,
                private _informationsService: DescriptionsService,
                private _scenesService: ScenegraphService) {
    }

    processMovementsBehavior() {
        let entities: Array<Entity> = [];
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("movable") && entity.hasBehavior("position")) {
                this._processEntityMovements(entity);
            }
        });
        return entities;
    }

    private _processEntityMovements(entity: Entity) {
        let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        let destinationPosition = this._getEntityDestinationPosition(positionBehavior, movableBehavior);
        if (this._mapService.isTileAtPositionIsWalkable(destinationPosition)) {
            this._processWalkableMovement(positionBehavior, movableBehavior, destinationPosition);
            if (this._isLeaveCity(destinationPosition)) {
                let newPosition: Position = this._mapService.getPositionOfCity(destinationPosition.mapId);
                this._scenesService.setMapForEntity(entity, newPosition)
                    .then(() => {
                        this._informationsService.addTextToInformation("Leave the city");
                    });
            }
        } else {
            this._informationsService.addTextToInformation("Blocked!");
        }
        movableBehavior.stay();
    }

    private _getEntityDestinationPosition(currentEntityPosition: PositionBehavior, entityDirection: MovableBehavior): Position {
        return currentEntityPosition.position.addVector(entityDirection.vector);
    }

    private _processWalkableMovement(positionBehavior: PositionBehavior, movableBehavior: MovableBehavior, destinationPosition: Position) {
        positionBehavior.moveTo(movableBehavior.vector);
        this._displayMoveInformation(movableBehavior.vector);
    }

    private _displayMoveInformation(vector: Position) {
        let direction: string = "";
        if (vector.col === 1) {
            direction = "East";
        }
        if (vector.col === -1) {
            direction = "West";
        }
        if (vector.row === 1) {
            direction = "South";
        }
        if (vector.row === -1) {
            direction = "North";
        }
        if (!_.isEmpty(direction)) {
            this._informationsService.addTextToInformation(direction);
        }
    }

    private _isLeaveCity(position: Position): boolean {
        if (position.mapId !== 0) {
            let mapMetaData = this._mapService.getMapMetadataByMapId(position.mapId);
            return (mapMetaData.borderbehavior === "exit" && this._isPositionInBorder(position, mapMetaData));
        }
        return false;
    }

    private _isPositionInBorder(position: Position, mapMetaData: IMap): boolean {
        return (position.row === 0 || position.col === 0 || position.row === mapMetaData.height - 1 || position.col === mapMetaData.width - 1);
    }
}
