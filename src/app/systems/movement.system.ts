import {Injectable} from "@angular/core";
import {EntitiesService} from "../services/entities/entities.service";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {TilesLoaderService} from "../services/tiles/tiles.service";

@Injectable()
export class MovementSystem {
    constructor(private _entities: EntitiesService, private _mapService: MapsService, private _tilesService: TilesLoaderService) {
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
            positionBehavior.moveTo(movableBehavior.vector);
        }
        movableBehavior.stay();
    }

    private _getEntityDestinationPosition(currentEntityPosition: PositionBehavior, entityDirection: MovableBehavior): Position {
        return currentEntityPosition.position.addVector(entityDirection.vector);
    }
}
