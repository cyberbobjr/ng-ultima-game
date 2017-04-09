export class Tile {
    tilesArray: Array<number> = [];
    currentTileIndex: number;
    _walkable: boolean = true;
    _blockLight: boolean = false;

    constructor(tilesArray: Array<number>) {
        this.tilesArray = tilesArray;
        this.currentTileIndex = 0;
    }

    getCurrentTile() {
        return this.tilesArray[this.currentTileIndex];
    }

    tick() {
        this._setNextTile();
    }

    private _setNextTile() {
        if (this.tilesArray.length > 1) {
            this.currentTileIndex++;
            if (this.currentTileIndex > this.tilesArray.length) {
                this.currentTileIndex = 0;
            }
        }
    }
}