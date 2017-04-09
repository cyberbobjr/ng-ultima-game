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

    moveUp() {
        this.position.row--;
    }

    moveDown() {
        this.position.row++;
    }

    moveLeft() {
        this.position.col--;
    }

    moveRight() {
        this.position.col++;
    }
}