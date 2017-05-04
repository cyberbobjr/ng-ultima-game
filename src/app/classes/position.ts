import * as _ from "lodash";

export class Position {
    mapId: number = 0;
    row: number;
    col: number;

    constructor(row?: number, col?: number, mapId?: number) {
        this.col = col;
        this.row = row;
        if (mapId) {
            this.mapId = mapId;
        }
    }

    addVector(vector: Position) {
        let resultPosition: Position = new Position(this.row, this.col, this.mapId);
        if (vector.col) {
            resultPosition.col += vector.col;
        }
        if (vector.row) {
            resultPosition.row += vector.row;
        }
        return resultPosition;
    }

    isEqual(positionToCompare: Position): boolean {
        return (positionToCompare.row === this.row && positionToCompare.col === this.col && _.toInteger(positionToCompare.mapId) === _.toInteger(this.mapId));
    }

    getVectorUp(): Position {
        return new Position(-1, 0, this.mapId);
    }

    getVectorDown(): Position {
        return new Position(1, 0, this.mapId);
    }

    getVectorLeft(): Position {
        return new Position(0, -1, this.mapId);
    }

    getVectorRight(): Position {
        return new Position(0, +1, this.mapId);
    }
}
