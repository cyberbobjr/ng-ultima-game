import {Injectable} from "@angular/core";

const TILES_COUNT = 256;

@Injectable()
export class TilesService {
    tiles: Array<HTMLImageElement> = [];

    constructor() {
    }

    loadTiles() {
        for (let i = 0; i < TILES_COUNT; i++) {
            this.tiles.push(this.loadTile(i));
        }
        return Promise.all(this.tiles);
    }

    private loadTile(index: number) {
        const img = new Image();
        img.src = `assets/tiles/${index}.png`;
        return img;
    }

    getTileAtIndex(index: number) {
        return this.tiles[index];
    }
}
