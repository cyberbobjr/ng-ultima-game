import {Position} from "./position";
import {IMapMetaData} from "../interfaces/IMap";
import {Entity} from "./entity";

export class GameMap {
    mapMetaData: IMapMetaData = null;
    mapData: number[][] = [];

    width: number;
    height: number;

    private _entitiesOnMap: Array<Entity> = [];

    constructor(mapMetaData: IMapMetaData, mapRawData: number[][]) {
        this._convertRawDataToMapData(mapRawData);
        this.mapMetaData = mapMetaData;
        this.width = mapRawData[0].length;
        this.height = mapRawData.length;
    }

    private _convertRawDataToMapData(rawData: number[][]) {
        let rowIndex: number = 0;
        let colIndex: number = 0;
        for (let rows of rawData) {
            this.mapData[rowIndex] = [];
            for (let cols of rows) {
                this.mapData[rowIndex][colIndex] = cols;
                colIndex++;
            }
            colIndex = 0;
            rowIndex++;
        }
    }

    getWidthMap() {
        return this.width - 1;
    }

    getHeightMap() {
        return this.height - 1;
    }

    getTileIndexAtPosition(position: Position): number {
        return this.mapData[position.row][position.col];
    }

    setEntitiesOnMap(entities: Array<Entity>) {
        this._entitiesOnMap = entities;
    }

    getEntitiesOnMap(): Array<Entity> {
        return this._entitiesOnMap;
    }

    setTileIndexAtPosition(tileIndex: number, position: Position) {
        this.mapData[position.row][position.col] = tileIndex;
    }
}
