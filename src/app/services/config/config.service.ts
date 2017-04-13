import {Injectable} from "@angular/core";
import {TilesLoaderService} from "../tiles/tiles.service";
import {MapsService} from "../maps/maps.service";

@Injectable()
export class ConfigService {

    constructor(private _tileService: TilesLoaderService, private _mapsService: MapsService) {
    }

    loadConfig(): Promise<any> {
        return Promise.all([
                               this._tileService.loadTiles(),
                               this._mapsService.loadAllMaps()
                           ]);
    }
}
