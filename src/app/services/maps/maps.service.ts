import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {gameMap} from "../../classes/game_map";

@Injectable()
export class MapsService {
    currentMap: gameMap;

    constructor(private _http: Http) {
    }

    initService(): Promise<any> {
        return this.loadWordlMap();
    }

    loadWordlMap(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.get("assets/maps/world.map")
                .subscribe((res) => {
                    const mapData = res.json();
                    this.currentMap = new gameMap("world", mapData);
                    resolve(true);
                });
        });
    }

    getTileInfoAtXY(x: number, y: number) {
        return this.currentMap[x][y];
    }

    getMap(): gameMap {
        return this.currentMap;
    }
}
