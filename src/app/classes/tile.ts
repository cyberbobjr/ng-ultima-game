export class Tile {
    tileImage: HTMLImageElement = null;
    tileRules: string = "";
    tilesArray: Array<number> = [];
    currentTileIndex: number;
    tileName: string;

    constructor(tileName: string) {
        this.tileName = tileName;
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