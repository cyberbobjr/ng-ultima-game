export class gameMap {
    name: string;
    tiles: number[][];

    width: number;
    height: number;

    constructor(name: string, tiles: number[][]) {
        this.tiles = tiles;
        this.name = name;
        this.width = tiles[0].length;
        this.height = tiles.length;
    }

    getWidthMap() {
        return this.width;
    }

    getHeightMap() {
        return this.height;
    }
}