import {IBehavior} from "../interfaces/IBehavior";

export class DirectionBehavior implements IBehavior {
    name = "direction";
    private directionRow: number = 0;
    private directionCol: number = 0;

    constructor() {

    }

    tick(): any {
        return null;
    }

    moveUp() {
        this.directionRow = -1;
    }

    moveDown() {
        this.directionRow = 1;
    }

    moveRight() {
        this.directionCol = 1;
    }

    moveLeft() {
        this.directionCol = -1;
    }
}
