import {Position} from "./position";
import {IMap} from "../interfaces/IMap";

export class GameMap {
  mapMetaData: IMap = null;
  mapData: number[][] = [];

  width: number;
  height: number;

  constructor(mapMetaData: IMap, mapRawData: number[][]) {
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
}
