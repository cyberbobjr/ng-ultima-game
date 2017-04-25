import {Injectable} from "@angular/core";
import {GameMap} from "../../classes/game_map";
import {Position} from "../../classes/position";
import {TilesLoaderService} from "../tiles/tiles.service";
import {ITile} from "../../interfaces/ITile";
import {IMapMetaData} from "../../interfaces/IMap";
import * as _ from "lodash";
import {IPortal} from "../../interfaces/IPortal";
import {EntitiesService} from "../entities/entities.service";
import {Entity} from "../../classes/entity";

@Injectable()
export class MapsService {
    private _currentMap: GameMap;
    mapsMetaData: Array<IMapMetaData> = [];

    constructor(private _tileloader: TilesLoaderService,
                private _entitiesService: EntitiesService) {
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
        try {
            return this._currentMap.getTileIndexAtPosition(position);
        } catch (err) {
            console.log(position);
        }
    }

    isTileAtPositionIsClosedDoor(position: Position): boolean {
        let tileIndex: number = this.getTileIndexAtPosition(position);
        let tile: ITile = this._tileloader.getTileByIndex(tileIndex);
        return this._tileloader.isTileClosedDoor(tile.name);
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
        if (this._isPositionOutOfBounds(position)) {
            return false;
        }
        let tileIndex: number = this.getTileIndexAtPosition(position);
        let tile: ITile = this._tileloader.getTileByIndex(tileIndex);
        return this._tileloader.isTileWalkable(tile.name);
    }

    private _isPositionOutOfBounds(position: Position): boolean {
        if (position.row < 0 || position.col < 0) {
            return true;
        }
        return (position.row > this._currentMap.getHeightMap() || position.col > this._currentMap.getWidthMap());
    }

    loadMapByMapId(mapId: number): Promise<GameMap> {
        let mapMetaData: IMapMetaData = this.getMapMetadataByMapId(mapId);
        return this.loadMapByFilename(mapMetaData.fname)
                   .then((mapData: any) => {
                       this._currentMap = new GameMap(mapMetaData, mapData);
                   })
                   .then(() => {
                       return this._currentMap;
                   });
    }

    getMapMetadataByMapId(id: number): IMapMetaData {
        return _.find(this.mapsMetaData, {"id": id.toString()});
    }

    loadAllMaps(): Promise<any> {
        return fetch("/assets/maps.json")
            .then((res) => {
                return res.json();
            })
            .then((jsonValue: any) => {
                this.mapsMetaData = _.map(jsonValue.maps.map, (map: IMapMetaData) => {
                    return map;
                });
                return this.mapsMetaData;
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

    getPositionOfPortalId(portalId: number): Position {
        let portalInformation = this.getPortalInformationByPortalId(portalId);
        return new Position(parseInt(portalInformation.y, 10), parseInt(portalInformation.x, 10), 0);
    }

    getPortalInformationByPortalId(portalId: number): IPortal {
        let metaData: any = this.getMapMetadataByMapId(0);
        return _.find(metaData.portal, {"destmapid": portalId.toString()});
    }

    getCurrentMap(): GameMap {
        return this._currentMap;
    }

    getEntitiesOnCurrentMap(): Array<Entity> {
        let entities: Array<Entity> = this._entitiesService.getEntitiesForMapId(this._currentMap.mapMetaData.id);
        return _.concat(entities, this._entitiesService.getPlayer());
    }

    getAllMaps(): Array<IMapMetaData> {
        return this.mapsMetaData;
    }

    openDoorAtPosition(position: Position) {
        try {
            let floorTileIndex: number = this._tileloader.tileset.getTileIndexByName("brick_floor");
            this._currentMap.setTileIndexAtPosition(floorTileIndex, position);

            window.setTimeout(() => {
                this.closeDoorAtPosition(position);
            }, 1500);

        } catch (error) {
            console.log(error.message);
        }
    }

    closeDoorAtPosition(position: Position) {
        try {
            let doorTileIndex: number = this._tileloader.tileset.getTileIndexByName("door");
            this._currentMap.setTileIndexAtPosition(doorTileIndex, position);
        } catch (error) {
            console.log(error.message);
        }
    }
}
