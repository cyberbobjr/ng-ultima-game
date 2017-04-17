import {Injectable} from "@angular/core";
import {GameMap} from "../../classes/game_map";
import {Position} from "../../classes/position";
import {TilesLoaderService} from "../tiles/tiles.service";
import {ITile} from "../../interfaces/ITile";
import {IMap} from "../../interfaces/IMap";
import * as _ from "lodash";
import {IPortal} from "../../interfaces/IPortal";
import {EntitiesService} from "../entities/entities.service";
import {Entity} from "../../classes/entity";

@Injectable()
export class MapsService {
    private _currentMap: GameMap;
    maps: Array<IMap> = [];

    constructor(private _tileloader: TilesLoaderService, private _entitiesService: EntitiesService) {
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

    getTileIndexAtPosition(position: Position): number {
        return this._currentMap.getTileIndexAtPosition(position);
    }

    isTileAtPositionIsOpaque(position: Position): boolean {
        let tileIndex: number = this.getTileIndexAtPosition(position);
        let tile: ITile = this._tileloader.getTileByIndex(tileIndex);
        if (!tile || !tile.name) {
            console.log("erreur " + JSON.stringify(position));
            console.log("tile " + tile);
        }
        return this._tileloader.isTileOpaque(tile.name);
    }

    isTileAtPositionIsWalkable(position: Position): boolean {
        let tileIndex: number = this.getTileIndexAtPosition(position);
        let tile: ITile = this._tileloader.getTileByIndex(tileIndex);
        return this._tileloader.isTileWalkable(tile.name);
    }

    loadMapByMapId(mapId: number): Promise<GameMap> {
        let mapMetaData: IMap = this.getMapMetadataByMapId(mapId);
        return this.loadMapByFilename(mapMetaData.fname)
                   .then((mapData: any) => {
                       this._currentMap = new GameMap(mapMetaData, mapData);
                       return this._entitiesService.loadAllEntitiesForMap(mapMetaData);
                   })
                   .then(() => {
                       return this._currentMap;
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

    getPortalForPosition(position: Position): IPortal {
        let metaData: any = this.getMapMetadataByMapId(position.mapId);
        let portals = metaData.portal;
        let portal = this._getPortalInPosition(portals, position);
        if (portal) {
            return portal;
        } else {
            throw new Error("No Portal for this position");
        }
    }

    getPositionOfCity(mapId: number): Position {
        let portalInformation = this.getPortalInformation(mapId);
        return new Position(parseInt(portalInformation.y, 10), parseInt(portalInformation.x, 10), 0);
    }

    getPortalInformation(mapId: number): IPortal {
        let metaData: any = this.getMapMetadataByMapId(0);
        return _.find(metaData.portal, {"destmapid": mapId.toString()});
    }

    getCurrentMap(): GameMap {
        return this._currentMap;
    }

    setEntitiesOnMap(entities: Array<Entity>) {
        this._currentMap.setEntitiesOnMap(entities);
    }

    getEntitiesOnCurrentMap(): Array<Entity> {
        return this._currentMap.getEntitiesOnMap();
    }
}
