import {Injectable} from "@angular/core";
import {TilesLoaderService} from "../tiles/tiles.service";
import {MapsService} from "../maps/maps.service";
import {EntitiesService} from "../entities/entities.service";
import {IMap} from "../../interfaces/IMap";

@Injectable()
export class ConfigService {

    constructor(private _tileService: TilesLoaderService,
                private _mapsService: MapsService,
                private _entitiesService: EntitiesService) {
    }

    loadConfig(): Promise<any> {
        return Promise.all([
                               this._tileService.loadTiles(),
                               this._mapsService.loadAllMaps()
                           ])
                      .then(() => {
                          let maps: Array<IMap> = this._mapsService.getAllMaps();
                          return this._entitiesService.loadAllEntitiesForMaps(maps);
                      });
    }
}
