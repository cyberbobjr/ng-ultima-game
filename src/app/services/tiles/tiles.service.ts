import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Http} from "@angular/http";
import {Tileset} from "../../classes/Tileset";
import {ITile} from "../../interfaces/ITile";
import {ITileset} from "../../interfaces/ITileset";
import * as _ from "lodash";

@Injectable()
export class TilesLoaderService {
    numberOfTilesLoaded: number = 0;
    numberOfTilesLoaded$: Subject<number> = new Subject();
    tileset: Tileset;
    tilesRules: { name: string };

    constructor(private _http: Http) {
        this.numberOfTilesLoaded$.next(0);
    }

    loadTiles(): Promise<any> {
        this._loadJsonTilesRules();
        this._parseJsonTileDefiniftion();

        return new Promise((resolve, reject) => {
            this.numberOfTilesLoaded$.subscribe((numberOfTilesLoaded: number) => {
                if (numberOfTilesLoaded === this.tileset.tile.length) {
                    resolve(true);
                }
            }, (err) => {
                reject(err);
            });
        });
    }

    private _loadJsonTilesRules(): Promise<{ name: string }> {
        return new Promise((resolve, reject) => {
            this._http.get("assets/tiles_rules.json")
                .subscribe((res) => {
                    this.tilesRules = (res.json()).tileRules.rule;
                    resolve(this.tilesRules);
                }, (err) => {
                    reject(err);
                });
        });
    }

    private _parseJsonTileDefiniftion() {
        this._loadJsonTileDefinition()
            .then((tileset: ITileset) => {
                this.tileset = new Tileset(tileset.name, tileset.tile);
            })
            .then(() => {
                return this._loadJsonTilesRules();
            })
            .then(() => {
                this._loadImagesTileset();
            });
    }

    private _loadImagesTileset() {
        for (let tile of this.tileset.tile) {
            let tileImage: HTMLImageElement = this._loadTileFileByName(tile.name);
            this.tileset.setImageForTileById(tileImage, tile.id);
        }
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

    private _loadJsonTileDefinition(): Promise<ITileset> {
        return new Promise((resolve, reject) => {
            this._http.get("assets/tiles.json")
                .subscribe((res) => {
                    let definition = res.json();
                    resolve(definition.tileset);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    getTileByIndex(index: number): ITile {
        return this.tileset.getTileAtIndex(index);
    }

    getTileByName(tileName: string): ITile {
        return _.find(this.tileset.tile, {"name": tileName});
    }

    isTileOpaque(tileName: string): boolean {
        let tile = _.find(this.tileset.tile, {"name": tileName});
        return _.has(tile, "opaque");
    }

    isTileWalkable(tileName: string): boolean {
        let tile = this.getTileByName(tileName);
        let rule = this._getRuleName(tile.rule);
        let cantwalkon = _.get(rule, "cantwalkon");

        return (cantwalkon !== "all");
    }

    isTileClosedDoor(tileName: string): boolean {
        let tile = this.getTileByName(tileName);
        let rule = this._getRuleName(tile.rule);
        return _.has(rule, "door");
    }

    isTileTalkOver(tileName: string): boolean {
        let tile = this.getTileByName(tileName);
        let rule = this._getRuleName(tile.rule);
        return _.has(rule, "talkover");
    }

    getTileSpeed(tileName: string): number {
        let tile = this.getTileByName(tileName);
        let rule = this._getRuleName(tile.rule);
        let speed = _.get(rule, "speed");

        switch (speed) {
            case "slow" :
                return 1.10;
            case "vslow" :
                return 1.5;
            case "vvslow" :
                return 1.75;
            default:
                return 1;
        }
    }

    _getRuleName(ruleName: string): Object {
        return _.find(this.tilesRules, {"name": ruleName});
    }
}
