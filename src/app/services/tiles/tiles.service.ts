import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

const TILES_COUNT = 256;

@Injectable()
export class TilesLoaderService {
    tiles: Array<HTMLImageElement> = [];
    numberOfTilesLoaded: number = 0;
    numberOfTilesLoaded$: Subject<number> = new Subject();

    constructor() {
        this.numberOfTilesLoaded$.next(0);
    }

    loadTiles() {
        for (let i = 0; i < TILES_COUNT; i++) {
            this.tiles.push(this.loadTile(i));
        }
        return new Promise((resolve, reject) => {
            this.numberOfTilesLoaded$.subscribe((numberOfTilesLoaded) => {
                if (numberOfTilesLoaded === TILES_COUNT) {
                    resolve(true);
                }
            });
        });
    }

    private loadTile(index: number) {
        const img = new Image();
        img.onload = () => {
            this.numberOfTilesLoaded++;
            this.numberOfTilesLoaded$.next(this.numberOfTilesLoaded);
        };
        img.src = `assets/tiles/${index}.png`;
        return img;
    }

    getTileAtIndex(index: number): HTMLImageElement {
        return this.tiles[index];
    }
}
