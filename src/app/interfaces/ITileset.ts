import {ITile} from "../interfaces/ITile";

export interface ITileset {
  name: string;
  imageName: string;
  tile: Array<ITile>;
}
