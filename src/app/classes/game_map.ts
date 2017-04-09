import {Tile} from "./tile";
import {Position} from "./position";

export class GameMap {
    name: string;
    tiles: Tile[][] = [];

    width: number;
    height: number;

    constructor(name: string, mapRawData: number[][]) {
        this._convertRawDataToMap(mapRawData);
        this.name = name;
        this.width = mapRawData[0].length;
        this.height = mapRawData.length;
    }

    private _convertRawDataToMap(rawData: number[][]) {
        let rowIndex: number = 0;
        let colIndex: number = 0;
        for (let rows of rawData) {
            this.tiles[rowIndex] = [];
            for (let cols of rows) {
                let tile = new Tile([cols]);
                this.tiles[rowIndex][colIndex] = tile;
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
        return [this.tiles[position.row][position.col]];
    }
}