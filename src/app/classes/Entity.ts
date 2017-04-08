import {Position} from "./position";
import {Tile} from "./tile";

export class Entity {
    tile: Tile;
    position: Position;

    constructor(tile: Tile) {
        this.tile = tile;
    }

    getTile(): Tile {
        return this.tile;
    }
}