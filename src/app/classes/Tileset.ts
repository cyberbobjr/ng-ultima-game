import {ITile} from "../interfaces/ITile";
import {ITileset} from "../interfaces/ITileset";
import * as _ from "lodash";

export class Tileset implements ITileset {
    name: string;
    tile: Array<ITile>;

    _internalTilesIndices: Map<number, ITile> = new Map();

    constructor(name: string, tile: Array<ITile>) {
        this.name = name;
        this.tile = tile;
        this._buildTileIndex();
    }

    private _buildTileIndex() {
        let currentIndex: number = 0;
        _.map(this.tile, (tile: any) => {
            if (tile.frames) {
                let frameCounter = parseInt(<string>tile.frames, 10);
                currentIndex = tile.id;
                for (let i = 0; i < frameCounter; i++) {
                    let cloneTile = _.clone(tile);
                    cloneTile.currentFrame = i;
                    this._internalTilesIndices.set(currentIndex, cloneTile);
                    currentIndex++;
                }
            } else {
                tile.currentFrame = 0;
                this._internalTilesIndices.set(currentIndex, tile);
                currentIndex++;
            }
        });
    }

    setImageForTileById(image: HTMLImageElement, tileId: number) {
        this._internalTilesIndices.forEach((tile: ITile, key: number) => {
            if (tile.id === tileId) {
                tile.image = image;
            }
        });
        _.map(this.tile, (tile) => {
            if (tile.id === tileId) {
                tile.image = image;
            }
        });
    }

    getTileAtIndex(index: number): ITile {
        return this._internalTilesIndices.get(index);
    }
}
