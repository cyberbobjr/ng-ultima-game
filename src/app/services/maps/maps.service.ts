import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {gameMap} from "../../classes/game_map";
import {Position} from "../../classes/position";
import {Tile} from "../../classes/tile";

@Injectable()
export class MapsService {
    currentMap: gameMap;

    constructor(private _http: Http) {
    }

    loadMap(mapFilename: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.get(mapFilename)
                .subscribe((res) => {
                    const mapData = res.json();
                    this.currentMap = new gameMap("world", mapData);
                    resolve(true);
                });
        });
    }

    getTilesAtPosition(position: Position): Array<Tile> {
        return this.currentMap.getTilesAtPosition(position);
    }

    getMap(): gameMap {
        return this.currentMap;
    }
}
