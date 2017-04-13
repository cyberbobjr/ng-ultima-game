import {ITile} from "../interfaces/ITile";
import {ITileset} from "../interfaces/ITileset";
import * as _ from "lodash";

export class Tileset implements ITileset {
  name: string;
  imageName: string;
  tile: Array<ITile>;

  _internalTilesIndices: Map<number, number> = new Map();

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
        for (let i = 0; i < frameCounter; i++) {
          this._internalTilesIndices.set(currentIndex, tile.id);
          currentIndex++;
        }
      } else {
        this._internalTilesIndices.set(currentIndex, tile.id);
        currentIndex++;
      }
    });
  }

  getHtmlImageElementAtIndex(index: number): HTMLImageElement {
    let tile = this.getTileAtIndex(index);
    return tile.image;
  }

  getTileAtIndex(index: number): ITile {
    let tileId: number = this._internalTilesIndices.get(index);
    return _.find(this.tile, {"id": tileId});
  }
}
