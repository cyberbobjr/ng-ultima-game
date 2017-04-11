import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Http} from "@angular/http";
import {Tileset} from "../../classes/Tileset";
import * as _ from "lodash";

const TILES_COUNT = 256;

@Injectable()
export class TilesLoaderService {
    tiles: Array<HTMLImageElement> = [];
    numberOfTilesLoaded: number = 0;
    numberOfTilesLoaded$: Subject<number> = new Subject();
    tileset: Tileset;

    constructor(private _http: Http) {
        this.numberOfTilesLoaded$.next(0);
    }

    loadTiles(): Promise<any> {
        this._parseJsonTileDefiniftion();
        return new Promise((resolve, reject) => {
            this.numberOfTilesLoaded$.subscribe((numberOfTilesLoaded) => {
                if (numberOfTilesLoaded === this.tileset.tile.length) {
                    resolve(true);
                }
            });
        });
    }

    private _parseJsonTileDefiniftion() {
        this._loadJsonTileDefinition()
            .then((tileset: Tileset) => {
                this.tileset = tileset;
            })
            .then(() => {
                this._loadImagesTileset();
            });
    }

    private _loadImagesTileset() {
        for (let tile of this.tileset.tile) {
            tile["image"] = this._loadTileFileByName(tile.name);
        }
    }

    private _loadJsonTileDefinition(): Promise<Tileset> {
        return new Promise((resolve, reject) => {
            this._http.get("assets/mapData.json")
                .subscribe((res) => {
                    let definition = res.json();
                    resolve(definition.tileset);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    _oldLoadTiles(): Promise<any> {
        for (let i = 0; i < TILES_COUNT; i++) {
            this.tiles.push(this._loadTileFileByIndex(i));
        }
        return new Promise((resolve, reject) => {
            this.numberOfTilesLoaded$.subscribe((numberOfTilesLoaded) => {
                if (numberOfTilesLoaded === TILES_COUNT) {
                    resolve(true);
                }
            });
        });
    }

    private _loadTileFileByIndex(index: number): HTMLImageElement {
        const img = new Image();
        img.onload = () => {
            this.numberOfTilesLoaded++;
            this.numberOfTilesLoaded$.next(this.numberOfTilesLoaded);
        };
        img.src = `assets/tiles/${index}.png`;
        return img;
    }

    private _loadTileFileByName(name: string): HTMLImageElement {
        const img = new Image();
        img.onload = () => {
            this.numberOfTilesLoaded++;
            this.numberOfTilesLoaded$.next(this.numberOfTilesLoaded);
        };
        img.src = `assets/tiles/tile_${name}.png`;
        return img;
    }

    getTileAtIndex(index: number): HTMLImageElement {
        return this.tileset.tile[index]["image"];
    }

    getTileByName(tileName: string): any {
        return _.find(this.tileset.tile, {"name": tileName});
    }
}
