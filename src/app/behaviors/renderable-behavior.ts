import {IBehavior} from "../interfaces/IBehavior";
import {ITile} from "../interfaces/ITile";
import * as _ from "lodash";

export class RenderableBehavior implements IBehavior {
    name = "renderable";
    tile: ITile;

    constructor(tile: ITile) {
        this.tile = tile;
        this.tile.currentFrame = 0;
    }

    tick(PerformanceNow: number): any {
        if (this._isAnimatedTile()) {
            this._processNextFrame();
        }
        return null;
    }

    getTile(): ITile {
        return this.tile;
    }

    private _isAnimatedTile(): boolean {
        return (_.has(this.tile, "frames") && _.has(this.tile, "animation") && this.tile["animation"] === "frame");
    }

    private _processNextFrame() {
        if (this.tile.currentFrame < (parseInt(this.tile.frames, 10) - 1)) {
            this.tile.currentFrame++;
        } else {
            this.tile.currentFrame = 0;
        }
    }
}
