import {Injectable} from "@angular/core";
import {GameMap} from "../../classes/game_map";
import {Position} from "../../classes/position";
import {TilesLoaderService} from "../tiles/tiles.service";
import {ITile} from "../../interfaces/ITile";
import {IMap} from "../../interfaces/IMap";
import * as _ from "lodash";
import {IPortal} from "../../interfaces/IPortal";

@Injectable()
export class MapsService {
  currentMap: GameMap;
  maps: Array<IMap> = [];

  constructor(private _tileloader: TilesLoaderService) {
  }

  loadMapByFilename(mapFilename: string): Promise<number[][]> {
    return fetch(`/assets/maps/${mapFilename}`)
      .then((res: Response) => {
        return res.json();
      })
      .then((jsonValue: any) => {
        return jsonValue;
      });
  }

  getTileAtPosition(position: Position): ITile {
    return this.currentMap.getTileAtPosition(position);
  }

  isTileAtPositionIsOpaque(position: Position): boolean {
    let tile: ITile = this.getTileAtPosition(position);
    if (!tile || !tile.name) {
      console.log("erreur " + JSON.stringify(position));
      console.log("tile " + tile);
    }
    return this._tileloader.isTileOpaque(tile.name);
  }

  isTileAtPositionIsWalkable(position: Position): boolean {
    let tile: ITile = this.getTileAtPosition(position);
    return this._tileloader.isTileWalkable(tile.name);
  }

  loadMapByMapId(id: number): Promise<GameMap> {
    let mapMetaData: IMap = this.getMapMetadataByMapId(id);
    return this.loadMapByFilename(mapMetaData.fname)
               .then((mapData: any) => {
                 this.currentMap = new GameMap(mapMetaData, mapData, this._tileloader);
                 return this.currentMap;
               });
  }

  getMapMetadataByMapId(id: number): IMap {
    return _.find(this.maps, {"id": id.toString()});
  }

  loadAllMaps(): Promise<any> {
    return fetch("/assets/maps.json")
      .then((res) => {
        return res.json();
      })
      .then((jsonValue: any) => {
        this.maps = _.map(jsonValue.maps.map, (map: IMap) => {
          return map;
        });
        return jsonValue;
      });
  }

  private _getPortalInPosition(portals: Array<IPortal>, position: Position): IPortal | undefined {
    return _.find(portals, (portal: IPortal) => {
      return (parseInt(portal.x, 10) === position.col && parseInt(portal.y, 10) === position.row);
    });
  }

  getPortalMapIpForPosition(position: Position): number | boolean {
    let metaData: any = this.getMapMetadataByMapId(position.mapId);
    let portals = metaData.portal;
    let portal = this._getPortalInPosition(portals, position);
    if (portal) {
      return parseInt(portal.destmapid, 10);
    }
    return false;
  }
}
