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

    moveTo(vector: Position) {
        this.vector = vector;
    }

    stay() {
        this.vector.row = 0;
        this.vector.col = 0;
    }
}
