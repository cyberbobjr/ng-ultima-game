import {IBehavior} from "../interfaces/IBehavior";
import {Position} from "../classes/position";

export class MovableBehavior implements IBehavior {
    name = "movable";
    vector: Position = null;

    constructor() {
        this.vector = new Position(0, 0);
    }

    tick(PerformanceNow: number): any {
        return null;
    }

    moveUp() {
        this.vector.row = -1;
    }

    moveDown() {
        this.vector.row = 1;
    }

    moveRight() {
        this.vector.col = 1;
    }

    moveLeft() {
        this.vector.col = -1;
    }

    stay() {
        this.vector.row = 0;
        this.vector.col = 0;
    }
}
