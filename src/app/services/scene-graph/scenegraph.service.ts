import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Position} from "../../classes/position";
import {GameMap} from "../../classes/game_map";
import {Tile} from "../../classes/tile";
import {Entity} from "../../classes/entity";
import {ActorsService} from "../actors/actors.service";
import {MapsService} from "../maps/maps.service";

@Injectable()
export class ScenegraphService {
    visibleWindow$: Subject<Array<Tile>[][]> = new Subject();
    visibleWindow: Array<Tile>[][] = [];
    map: GameMap;

    maxVisiblesCols: number;
    maxVisiblesRows: number;

    cameraStartPosition: Position = new Position();
    cameraEndPosition: Position = new Position();

    entityCenter: Entity = null;

    constructor(private _actorsService: ActorsService, private _mapService: MapsService) {
    }

    setMaxVisibleColsAndRows(maxWidth: number, maxHeight: number) {
        this.maxVisiblesCols = maxWidth;
        this.maxVisiblesRows = maxHeight;
    }

    loadMap(map: GameMap, cameraStartPosition?: Position) {
        this.map = map;
        if (cameraStartPosition !== undefined) {
            this.cameraStartPosition = cameraStartPosition;
        }
    }

    getVisiblesTilesAtPositions(position: Position): Array<Tile> {
        return this.visibleWindow[position.row][position.col];
    }

    refresh() {
        console.log("refresh scene");
        try {
            if (this.entityCenter !== null) {
                this._centerCameraOnEntity();
            }
            this._computeVisibleWindow();
            this._copyTilesToVisibleWindow();
            this._refreshVisibleWindow();
        } catch (error) {
            console.log(error);
        }
    }

    private _computeVisibleWindow() {
        console.log("_computeVisibleWindow scene");
        this.cameraEndPosition.col = this.cameraStartPosition.col + this.maxVisiblesCols + 1;
        this.cameraEndPosition.row = this.cameraStartPosition.row + this.maxVisiblesRows + 1;

        if (this.cameraEndPosition.col > this.map.getWidthMap()) {
            this.cameraEndPosition.col = this.map.getWidthMap();
        }
        if (this.cameraEndPosition.row > this.map.getHeightMap()) {
            this.cameraEndPosition.row = this.map.getHeightMap();
        }
    }

    private _copyTilesToVisibleWindow() {
        console.log("_copyTilesToVisibleWindow scene");
        let visibileColIndex = 0;
        let visibleRowIndex = 0;
        for (let y = this.cameraStartPosition.row; y <= this.cameraEndPosition.row; y++) {
            this.visibleWindow[visibleRowIndex] = [];
            for (let x = this.cameraStartPosition.col; x <= this.cameraEndPosition.col; x++) {
                this.visibleWindow[visibleRowIndex][visibileColIndex] = this._getTilesAtPosition(new Position(x, y));
                visibileColIndex++;
            }
            visibleRowIndex++;
            visibileColIndex = 0;
        }
    }

    private _getTilesAtPosition(position: Position): Array<Tile> {
        let tiles: Array<Tile> = [];
        let mapTiles = this._mapService.getTilesAtPosition(position);
        if (mapTiles.length > 0) {
            for (let mapTile of mapTiles) {
                tiles.push(mapTile);
            }
        }
        let actors = this._actorsService.getActorsAtPosition(position);
        if (actors.length > 0) {
            for (let actor of actors) {
                tiles.push(actor.getTile());
            }
        }
        return tiles;
    }

    private _refreshVisibleWindow() {
        console.log("_refreshVisibleWindow");
        this.visibleWindow$.next(this.visibleWindow);
    }

    setCenterCameraOnEntity(entity: Entity) {
        this.entityCenter = entity;
    }

    private _centerCameraOnEntity() {
        let entityPosition = this.entityCenter.position;
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
}
