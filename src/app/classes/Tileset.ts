import {ITile} from "../interfaces/ITile";
import {ITileset} from "../interfaces/ITileset";

export class Tileset implements ITileset {
  name: string;
  imageName: string;
  tile: Array<ITile>;

  constructor(name: string, tile: Array<ITile>) {
    this.name = name;
    this.tile = tile;
  }
}
