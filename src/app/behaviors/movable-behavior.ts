import {IBehavior} from "../interfaces/IBehavior";

export class MovableBehavior implements IBehavior {
    name = "movable";
    directionRow: number = 0;
    directionCol: number = 0;

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

    stay() {
        this.directionCol = 0;
        this.directionRow = 0;
    }
}
