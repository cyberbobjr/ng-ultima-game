import {Position} from "./position";
import {Tile} from "./tile";

export class Entity {
    tile: Array<Tile> = [];
    position: Position;
    tileIndex: number = 0;

    constructor(tile: Tile) {
        this.tile.push(tile);
    }

    getCurrentTile(): Tile {
        return this.tile[this.tileIndex];
    }
}