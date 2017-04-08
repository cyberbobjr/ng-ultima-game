export class Tile {
    tilesArray: Array<number> = [];
    currentTileIndex: number;

    constructor(tilesArray: Array<number>) {
        this.tilesArray = tilesArray;
        this.currentTileIndex = 0;
    }

    getCurrentTile() {
        this._setNextTile();
        return this.tilesArray[this.currentTileIndex];
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