import {IBehavior} from "../interfaces/IBehavior";
import {Tile} from "../classes/tile";

export class RenderableBehavior implements IBehavior {
    name = "renderable";
    tile: Tile;

    constructor(tile: Tile) {
        this.tile = tile;
    }

    tick(): any {
        this.tile.tick();
        return null;
    }

    getTile() {
        return this.tile;
    }
}
