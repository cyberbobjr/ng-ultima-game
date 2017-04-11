import {Tile} from "./tile";
import {Position} from "./position";
import {TilesLoaderService} from "../services/tiles/tiles.service";
import {ITile} from "../interfaces/ITile";

export class GameMap {
    name: string;
    mapData: ITile[][] = [];

    width: number;
    height: number;

    constructor(name: string, mapRawData: number[][], private _tilesService: TilesLoaderService) {
        this._convertRawDataToMap(mapRawData);
        this.name = name;
        this.width = mapRawData[0].length;
        this.height = mapRawData.length;
    }

    private _convertRawDataToMap(rawData: number[][]) {
        let rowIndex: number = 0;
        let colIndex: number = 0;
        for (let rows of rawData) {
            this.mapData[rowIndex] = [];
            for (let cols of rows) {
                let tile = new Tile([cols]);
                this.mapData[rowIndex][colIndex] = tile;
                colIndex++;
            }
            colIndex = 0;
            rowIndex++;
        }
    }

    getWidthMap() {
        return this.width;
    }

    getHeightMap() {
        return this.height;
    }

    getTilesAtPosition(position: Position): Array<Tile> {
        return [this.mapData[position.row][position.col]];
    }
}