import {Position} from "./position";
import {IBehavior} from "../interfaces/IBehavior";

export class Entity {
//    tile: Tile;
    //position: Position;
    private _behaviors: Map<string, IBehavior> = new Map();

    constructor() {
    }

    /*getTile(): Tile {
     return this.tile;
     }*/

    /*moveUp() {
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
    }*/

    addBehavior(behavior: IBehavior) {
        this._behaviors.set(behavior.name, behavior);
    }

    removeBehavior(behaviorName: string) {
        return this._behaviors.delete(behaviorName);
    }

    hasBehavior(behaviorName: string): boolean {
        return this._behaviors.has(behaviorName);
    }

    getBehavior(behaviorName: string): IBehavior {
        return this._behaviors.get(behaviorName);
    }
}
