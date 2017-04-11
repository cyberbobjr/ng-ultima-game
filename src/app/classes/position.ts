export class Position {
    row: number;
    col: number;

    constructor(row?: number, col?: number) {
        this.col = col;
        this.row = row;
    }

    addVector(vector: Position) {
        let resultPosition: Position = new Position(this.row, this.col);
        if (vector.col) {
            resultPosition.col += vector.col;
        }
        if (vector.row) {
            resultPosition.row += vector.row;
        }
        return resultPosition;
    }
}
