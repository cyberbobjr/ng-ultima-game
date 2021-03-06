import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Position} from "../../classes/position";
import {GameMap} from "../../classes/game_map";
import {Entity} from "../../classes/entity";
import {MapsService} from "../maps/maps.service";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {ITile} from "../../interfaces/ITile";
import {EntitiesService} from "../entities/entities.service";
import {IPortal} from "../../interfaces/IPortal";
import {TilesLoaderService} from "../tiles/tiles.service";
import * as _ from "lodash";

const MAX_WIDTH = 10;
const MAX_HEIGHT = 10;

@Injectable()
export class ScenegraphService {
    visibleWindow$: Subject<Array<ITile>[][]> = new Subject();
    visibleWindow: Array<ITile>[][] = [];
    fov_map: Array<Array<boolean>> = [[]];

    maxVisiblesCols: number = MAX_WIDTH;
    maxVisiblesRows: number = MAX_HEIGHT;

    cameraStartPosition: Position = new Position();
    cameraEndPosition: Position = new Position();

    entityCenter: Entity = null;

    constructor(private _entitiesService: EntitiesService,
                private _tilesService: TilesLoaderService,
                private _mapsService: MapsService) {
        // initiate fov map
        this.fov_map = new Array(256);
        for (let i = 0; i < (256); i++) {
            this.fov_map[i] = new Array(256);
        }
    }


    setMap(cameraStartPosition?: Position) {
        if (cameraStartPosition !== undefined) {
            this.cameraStartPosition = cameraStartPosition;
        }
    }

    getVisiblesTilesAtPositions(position: Position): Array<ITile> {
        return this.visibleWindow[position.row][position.col];
    }

    refresh() {
        try {
            if (this.entityCenter !== null) {
                this._centerCameraOnEntity();
            }
            this._computeViewport();
            this._computeFov();
            this._copyTilesToViewport();
            this._refreshViewport();
        } catch (error) {
            console.log(error);
        }
    }

    private _computeViewport() {
        let currentMap: GameMap = this._mapsService.getCurrentMap();
        this.cameraEndPosition.col = this.cameraStartPosition.col + this.maxVisiblesCols + 1;
        this.cameraEndPosition.row = this.cameraStartPosition.row + this.maxVisiblesRows + 1;

        if (this.cameraEndPosition.col > currentMap.getWidthMap()) {
            this.cameraEndPosition.col = currentMap.getWidthMap();
            this.cameraStartPosition.col = this.cameraEndPosition.col - this.maxVisiblesCols;
        }
        if (this.cameraEndPosition.row > currentMap.getHeightMap()) {
            this.cameraEndPosition.row = currentMap.getHeightMap();
            this.cameraStartPosition.row = this.cameraEndPosition.row - this.maxVisiblesRows;
        }
    }

    private _copyTilesToViewport() {
        let currentMap: GameMap = this._mapsService.getCurrentMap();
        let visibileColIndex = 0;
        let visibleRowIndex = 0;
        for (let y = this.cameraStartPosition.row; y <= this.cameraEndPosition.row; y++) {
            this.visibleWindow[visibleRowIndex] = [];
            for (let x = this.cameraStartPosition.col; x <= this.cameraEndPosition.col; x++) {
                let positionToDraw = new Position(y, x, currentMap.mapMetaData.id);
                this.visibleWindow[visibleRowIndex][visibileColIndex] =
                    this._isMapVisibleAtPosition(positionToDraw) ? this._getTilesAtPosition(positionToDraw) : [];
                visibileColIndex++;
            }
            visibleRowIndex++;
            visibileColIndex = 0;
        }
    }

    private _isMapVisibleAtPosition(position: Position) {
        return this.fov_map[position.row][position.col];
    }

    private _getTilesAtPosition(position: Position): Array<ITile> {
        let tiles: Array<ITile> = [];

        tiles.push(this._getMapTileAtPosition(position));
        tiles = _.concat(tiles, this._getEntitiesTilesAtPosition(position));
        return tiles;
    }

    private _getMapTileAtPosition(position: Position): ITile {
        let tileIndex: number = this._mapsService.getTileIndexAtPosition(position);
        return this._tilesService.getTileByIndex(tileIndex);
    }

    private _getEntitiesTilesAtPosition(position: Position): Array<ITile> {
        let entities = this._entitiesService.getEntitiesAtPosition(position);
        return (entities.length > 0) ? this._getTilesForEntities(entities) : [];
    }

    private _getTilesForEntities(entities: Array<Entity>): Array<ITile> {
        return _.map(entities, (entity: Entity) => {
            if (entity.hasTile()) {
                return entity.getEntityTile();
            }
        });
    }

    private _getCenterEntityPosition() {
        if (this.entityCenter.hasBehavior("position")) {
            let entityPosition = <PositionBehavior>this.entityCenter.getBehavior("position");
            return entityPosition.position;
        } else {
            throw new Error("Entity don't have position behavior");
        }
    }

    private _computeFov() {
        let playerPosition: Position = this._getCenterEntityPosition();
        let visibileColIndex = 0;
        let visibleRowIndex = 0;
        for (let y = this.cameraStartPosition.row; y <= this.cameraEndPosition.row; y++) {
            for (let x = this.cameraStartPosition.col; x <= this.cameraEndPosition.col; x++) {
                this._calcStraightLine(playerPosition, new Position(y, x));
                visibileColIndex++;
            }
            visibleRowIndex++;
            visibileColIndex = 0;
        }
    }

    private _refreshViewport() {
        this.visibleWindow$.next(this.visibleWindow);
    }

    setCenterCameraOnEntity(entity: Entity) {
        if (entity.hasBehavior("position")) {
            this.entityCenter = entity;
        } else {
            throw new Error("Entity don't have position behavior");
        }
    }

    private _centerCameraOnEntity() {
        let positionBahvior = <PositionBehavior>this.entityCenter.getBehavior("position");
        let entityPosition = positionBahvior.position;
        this.setCameraPosition(entityPosition);
    }

    setCameraPosition(cameraPosition: Position) {
        this.cameraStartPosition.col = cameraPosition.col - (this.maxVisiblesCols / 2);
        this.cameraStartPosition.row = cameraPosition.row - (this.maxVisiblesRows / 2);
        if (this.cameraStartPosition.col < 0) {
            this.cameraStartPosition.col = 0;
        }
        if (this.cameraStartPosition.row < 0) {
            this.cameraStartPosition.row = 0;
        }
    }

    private _calcStraightLine(playerPostion: Position, targetPosition: Position) {
        let x0 = playerPostion.col;
        let y0 = playerPostion.row;
        let x1 = targetPosition.col;
        let y1 = targetPosition.row;

        let visible = true;
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        while (true) {
            if ((playerPostion.row === y0) && (playerPostion.col === x0)) {
                this.fov_map[y0][x0] = true;
            } else {
                if (this._mapsService.isTileAtPositionIsOpaque(new Position(y0, x0))) {
                    this.fov_map[y0][x0] = visible;
                    visible = false;
                } else {
                    this.fov_map[y0][x0] = visible;
                }
            }

            if ((x0 === x1) && (y0 === y1)) {
                break;
            }

            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    setMapForEntity(entity: Entity, newPosition: Position): Promise<boolean> {
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        return this._mapsService.loadMapByMapId(newPosition.mapId)
                   .then(() => {
                       positionBehavior.setNewPosition(newPosition);
                       this.refresh();
                       return true;
                   });
    }

    enterInCity(entity: Entity, mapId: number) {
        let portalInformation: IPortal = <IPortal>this._mapsService.getPortalInformationForMapId(mapId);
        this.setMapForEntity(entity, new Position(parseInt(portalInformation.starty, 10), parseInt(portalInformation.startx, 10), mapId));
    }
}
