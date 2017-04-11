import {IBehavior} from "../interfaces/IBehavior";
import {Position} from "../classes/position";

export class PositionBehavior implements IBehavior {
    name = "position";
    position: Position;

    constructor(position: Position) {
        this.position = position;
    }

    tick(): any {
        return null;
    }

    moveTo(directionVector: Position) {
        this.position = this.position.addVector(directionVector);
    }
}