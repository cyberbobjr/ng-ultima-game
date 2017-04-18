import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {DescriptionsService} from "../services/informations/descriptions.service";
import {IMap} from "../interfaces/IMap";
import {ScenegraphService} from "../services/scene-graph/scenegraph.service";
import * as _ from "lodash";
import {ITile} from "../interfaces/ITile";
import {TilesLoaderService} from "../services/tiles/tiles.service";

@Injectable()
export class MovementSystem {
    constructor(private _tilesService: TilesLoaderService,
                private _mapService: MapsService,
                private _descriptionService: DescriptionsService,
                private _scenesService: ScenegraphService) {
    }

    processMovementsBehavior() {
        let entities: Array<Entity> = [];
        this._mapService.getEntitiesOnCurrentMap()
            .forEach((entity: Entity) => {
                if (entity.hasBehavior("movable") && entity.hasBehavior("position")) {
                    this._isPlayer(entity) ? this._processEntityMovementsPlayer(entity) : this._processEntityMovements(entity);
                }
            });
        return entities;
    }

    private _isPlayer(entity: Entity): boolean {
        return entity.hasBehavior("keycontrol");
    }

    private _processEntityMovements(entity: Entity) {
        let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        let destinationPosition = this._getEntityDestinationPosition(positionBehavior, movableBehavior);
        if (this._mapService.isTileAtPositionIsWalkable(destinationPosition)) {
            this._processWalkableMovement(entity, destinationPosition);
        }
        movableBehavior.stay();
    }

    private _processEntityMovementsPlayer(entity: Entity) {
        let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        let destinationPosition = this._getEntityDestinationPosition(positionBehavior, movableBehavior);
        if (this._mapService.isTileAtPositionIsWalkable(destinationPosition)) {
            if (this._isLeaveCity(destinationPosition)) {
                this._processLeaveCity(entity, destinationPosition);
            } else {
                this._processWalkableMovement(entity, destinationPosition);
            }
        } else {
            this._descriptionService.addTextToInformation("Blocked!");
        }
        movableBehavior.stay();
    }

    private _processLeaveCity(entity: Entity, destinationPosition: Position) {
        let newPosition: Position = this._mapService.getPositionOfPortalId(destinationPosition.mapId);
        this._scenesService.setMapForEntity(entity, newPosition)
            .then(() => {
                this._descriptionService.addTextToInformation("LEAVING...");
            });
    }

    private _getEntityDestinationPosition(currentEntityPosition: PositionBehavior, entityDirection: MovableBehavior): Position {
        return currentEntityPosition.position.addVector(entityDirection.vector);
    }

    private _processWalkableMovement(entity: Entity, destinationPosition: Position) {
        let tileIndex: number = this._mapService.getTileIndexAtPosition(destinationPosition);
        let tile: ITile = this._tilesService.getTileByIndex(tileIndex);
        let speed = this._tilesService.getTileSpeed(tile.name);
        if ((speed === 1) || this._slowMove(speed)) {
            let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
            let positionBehavior = <PositionBehavior>entity.getBehavior("position");
            positionBehavior.moveTo(movableBehavior.vector);
            this._displayMoveInformation(movableBehavior.vector);
        } else {
            this._descriptionService.addTextToInformation("Slow progress!");
        }
    }

    private _slowMove(speedTile: number): boolean {
        return (Math.floor(Math.random() * speedTile) + 1 === 1);
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
            this._descriptionService.addTextToInformation(direction);
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
        return (position.row === 0 || position.col === 0 || position.row === mapMetaData.height - 1
                || position.col === mapMetaData.width - 1);
    }
}
