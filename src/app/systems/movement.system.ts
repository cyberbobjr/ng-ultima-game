import {Injectable} from "@angular/core";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "../behaviors/movable-behavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";
import {MapsService} from "../services/maps/maps.service";
import {DescriptionsService} from "../services/descriptions/descriptions.service";
import {IMapMetaData} from "../interfaces/IMap";
import {ScenegraphService} from "../services/scene-graph/scenegraph.service";
import * as _ from "lodash";
import {ITile} from "../interfaces/ITile";
import {TilesLoaderService} from "../services/tiles/tiles.service";
const NORMAL_MOVE_SPEED = 1;

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
                if (entity.hasBehavior("movable") && this._isEntityMoving(entity)) {
                    this._processEntityMovements(entity);
                }
            });
        return entities;
    }

    private _isEntityMoving(entity: Entity): boolean {
        let movabeBehavior = <MovableBehavior>entity.getBehavior("movable");
        return this._isMoving(movabeBehavior.vector);
    }

    private _isMoving(vectorDirection: Position): boolean {
        return (vectorDirection.col !== 0 || vectorDirection.row !== 0);
    }

    private _processEntityMovements(entity: Entity) {
        let destinationPosition = this._getEntityDestinationPosition(entity);
        if (this._mapService.isTileAtPositionIsWalkable(destinationPosition)) {
            // @TODO Refactor these if
            if (this._canLeaveCity(entity) && this._isLeavingCity(destinationPosition)) {
                this._processLeavingCity(entity, destinationPosition);
            } else {
                this._processWalkableMovement(entity, destinationPosition);
            }
        } else {
            this._displayInformation(entity, "Blocked!");
        }
        this._setEntityStay(entity);
    }

    private _setEntityStay(entity: Entity) {
        let movableEntity = <MovableBehavior>entity.getBehavior("movable");
        movableEntity.stay();
    }

    private _processLeavingCity(entity: Entity, destinationPosition: Position) {
        let newPosition: Position = this._mapService.getPositionOfPortalId(destinationPosition.mapId);
        this._scenesService.setMapForEntity(entity, newPosition)
            .then(() => {
                this._displayInformation(entity, "LEAVING...");
            });
    }

    private _getEntityDestinationPosition(entity): Position {
        let entityDirection = <MovableBehavior>entity.getBehavior("movable");
        let currentEntityPosition = <PositionBehavior>entity.getBehavior("position");
        return currentEntityPosition.position.addVector(entityDirection.vector);
    }

    private _processWalkableMovement(entity: Entity, destinationPosition: Position) {
        let tileIndex: number = this._mapService.getTileIndexAtPosition(destinationPosition);
        let tile: ITile = this._tilesService.getTileByIndex(tileIndex);
        let speed = this._tilesService.getTileSpeed(tile.name);
        if ((speed === NORMAL_MOVE_SPEED) || this._canMoveAtNormalSpeed(speed)) {
            this._moveEntity(entity);
        } else {
            this._displayInformation(entity, "Slow progress!");
        }
    }

    private _canMoveAtNormalSpeed(speedTile: number): boolean {
        return (Math.floor(Math.random() * speedTile) + 1 === 1);
    }

    private _moveEntity(entity: Entity) {
        let movableBehavior = <MovableBehavior>entity.getBehavior("movable");
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        positionBehavior.moveTo(movableBehavior.vector);
        let moveInformationText = this._getTextMoveDirection(movableBehavior.vector);
        this._displayInformation(entity, moveInformationText);
    }

    private _getTextMoveDirection(vector: Position): string {
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
        return direction;
    }

    private _isLeavingCity(position: Position): boolean {
        if (position.mapId !== 0) {
            let mapMetaData = this._mapService.getMapMetadataByMapId(position.mapId);
            return (mapMetaData.borderbehavior === "exit" && this._isPositionInBorder(position, mapMetaData));
        }
        return false;
    }

    private _isPositionInBorder(position: Position, mapMetaData: IMapMetaData): boolean {
        return (position.row === 0 || position.col === 0 || position.row === mapMetaData.height - 1
        || position.col === mapMetaData.width - 1);
    }

    private _displayInformation(entity: Entity, textToDisplay: string) {
        if (entity.displayInfo) {
            this._descriptionService.addTextToInformation(textToDisplay);
        }
    }

    private _canLeaveCity(entity: Entity): boolean {
        return entity.hasBehavior("travelcity");
    }
}
