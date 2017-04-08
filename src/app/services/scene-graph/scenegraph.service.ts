import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Position} from "../../classes/position";
import {gameMap} from "../../classes/game_map";

@Injectable()
export class ScenegraphService {
    visiblemap$: Subject<number[][]> = new Subject();
    visiblemap: number[][] = [];
    map: gameMap;

    maxVisiblesCols: number;
    maxVisiblesRows: number;

    startVisible: Position = new Position();
    endVisible: Position = new Position();

    constructor() {
    }

    setMaxVisibleColsAndRows(maxWidth: number, maxHeight: number) {
        this.maxVisiblesCols = maxWidth;
        this.maxVisiblesRows = maxHeight;
    }

    loadScene(map: gameMap, startPosition: Position) {
        this.map = map;
        this.startVisible = startPosition;
    }

    getVisibleTileAtPosition(position: Position) {
        return this.visiblemap[position.row][position.col];
    }

    refresh() {
        console.log("refresh scene");
        try {
            this._computeVisibleMap();
            this._setVisibleMap();
            this._refreshVisibleMap();
        } catch (error) {
            console.log(error);
        }
    }

    private _computeVisibleMap() {
        console.log("_computeVisibleMap scene");
        this.endVisible.col = this.startVisible.col + this.maxVisiblesCols;
        this.endVisible.row = this.startVisible.row + this.maxVisiblesRows;

        if (this.endVisible.col > this.map.getWidthMap()) {
            this.endVisible.col = this.map.getWidthMap();
        }
        if (this.endVisible.row > this.map.getHeightMap()) {
            this.endVisible.row = this.map.getHeightMap();
        }
    }

    private _setVisibleMap() {
        console.log("_setVisibleMap scene");
        let visibileColIndex = 0;
        let visibleRowIndex = 0;
        for (let y = this.startVisible.row; y <= this.endVisible.row; y++) {
            this.visiblemap[visibleRowIndex] = [];
            for (let x = this.startVisible.col; x <= this.endVisible.col; x++) {
                this.visiblemap[visibleRowIndex][visibileColIndex] = this.map.tiles[y][x];
                visibileColIndex++;
            }
            visibleRowIndex++;
            visibileColIndex = 0;
        }
    }

    private _refreshVisibleMap() {
        console.log("_refreshVisibleMap");
        this.visiblemap$.next(this.visiblemap);
    }
}
