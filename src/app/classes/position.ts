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
