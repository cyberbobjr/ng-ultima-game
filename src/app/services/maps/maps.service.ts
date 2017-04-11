import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {GameMap} from "../../classes/game_map";
import {Position} from "../../classes/position";
import {TilesLoaderService} from "../tiles/tiles.service";
import {ITile} from "../../interfaces/ITile";

@Injectable()
export class MapsService {
  currentMap: GameMap;

  constructor(private _http: Http, private _tileloader: TilesLoaderService) {
  }

  loadMap(mapFilename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.get(mapFilename)
          .subscribe((res) => {
            const mapData = res.json();
            this.currentMap = new GameMap("world", mapData, this._tileloader);
            resolve(true);
          });
    });
  }

  getTileAtPosition(position: Position): ITile {
    return this.currentMap.getTileAtPosition(position);
  }

  getMap(): GameMap {
    return this.currentMap;
  }

  isTileAtPositionIsOpaque(position: Position): boolean {
    let tile: ITile = this.getTileAtPosition(position);
    return this._tileloader.isTileOpaque(tile.name);
  }
}
