import {IBehavior} from "../interfaces/IBehavior";
import {ITile} from "../interfaces/ITile";

export class RenderableBehavior implements IBehavior {
  name = "renderable";
  tile: ITile;

  constructor(tile: ITile) {
    this.tile = tile;
  }

  tick(): any {
    //@TODO : implement tick Tile Rule
    return null;
  }

  getTile(): ITile {
    return this.tile;
  }
}
