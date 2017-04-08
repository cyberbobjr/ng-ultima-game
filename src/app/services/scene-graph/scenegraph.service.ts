import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Position} from "../../classes/position";
import {gameMap} from "../../classes/game_map";
import {Tile} from "../../classes/tile";
import {Entity} from "../../classes/Entity";
import {PlayerService} from "../player/player.service";

@Injectable()
export class ScenegraphService {
    visibleWindow$: Subject<Array<Tile>[][]> = new Subject();
    visibleWindow: Array<Tile>[][] = [];
    map: gameMap;

    player: Entity;
    entities: Array<Entity> = [];

    maxVisiblesCols: number;
    maxVisiblesRows: number;

    startVisible: Position = new Position();
    endVisible: Position = new Position();

    constructor(private _playerService: PlayerService) {
    }

    setMaxVisibleColsAndRows(maxWidth: number, maxHeight: number) {
        this.maxVisiblesCols = maxWidth;
        this.maxVisiblesRows = maxHeight;
    }

    addActor(actor: Entity) {
        this.entities.push(actor);
    }

    loadScene(map: gameMap, startPosition: Position) {
        this.map = map;
        this.startVisible = startPosition;
    }

    getVisiblesTilesAtPositions(position: Position): Array<Tile> {
        return this.visibleWindow[position.row][position.col];
    }

    refresh() {
        console.log("refresh scene");
        try {
            this._computeVisibleWindow();
            this._setVisibleWindow();
            this._refreshVisibleWindow();
        } catch (error) {
            console.log(error);
        }
    }

    private _computeVisibleWindow() {
        console.log("_computeVisibleWindow scene");
        this.endVisible.col = this.startVisible.col + this.maxVisiblesCols + 1;
        this.endVisible.row = this.startVisible.row + this.maxVisiblesRows + 1;

        if (this.endVisible.col > this.map.getWidthMap()) {
            this.endVisible.col = this.map.getWidthMap();
        }
        if (this.endVisible.row > this.map.getHeightMap()) {
            this.endVisible.row = this.map.getHeightMap();
        }
    }

    private _setVisibleWindow() {
        console.log("_setVisibleWindow scene");
        this._setMapToVisibleWindow();
    }

    private _setMapToVisibleWindow() {
        let visibileColIndex = 0;
        let visibleRowIndex = 0;
        for (let y = this.startVisible.row; y <= this.endVisible.row; y++) {
            this.visibleWindow[visibleRowIndex] = [];
            for (let x = this.startVisible.col; x <= this.endVisible.col; x++) {
                let tile: Array<Tile> = [];
                tile.push(this.map.getTileAtPosition(new Position(y, x)));
                let actors = this._getVisiblesEntities(new Position(y, x));
                if (actors.length > 0) {
                    for (let actor of actors) {
                        tile.push(actor.getCurrentTile());
                    }
                }
                this.visibleWindow[visibleRowIndex][visibileColIndex] = tile;
                visibileColIndex++;
            }
            visibleRowIndex++;
            visibileColIndex = 0;
        }
    }

    private _getVisiblesEntities(position: Position): Array<Entity> {
        return this.entities.filter((entity: Entity) => {
            return (entity.position.col === position.col && entity.position.row === position.row);
        });
    }

    private _refreshVisibleWindow() {
        console.log("_refreshVisibleWindow");
        this.visibleWindow$.next(this.visibleWindow);
    }
}
