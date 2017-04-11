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

  moveTo(colDirection: number, rowDirection: number) {
    if (colDirection === 1) {
      this.moveToRight();
    }
    if (colDirection === -1) {
      this.moveToLeft();
    }
    if (rowDirection === 1) {
      this.moveToDown();
    }
    if (rowDirection === -1) {
      this.moveToUp();
    }
  }

  moveToLeft() {
    this.position.col--;
  }

  moveToRight() {
    this.position.col++;
  }

  moveToUp() {
    this.position.row--;
  }

  moveToDown() {
    this.position.row++;
  }
}
