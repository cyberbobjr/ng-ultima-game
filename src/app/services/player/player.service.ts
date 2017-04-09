import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Position} from "../../classes/position";
import {Tile} from "../../classes/tile";

const TILE_PLAYER = 31;

@Injectable()
export class PlayerService {

    player: Entity = null;

    constructor() {
        this.player = new Entity(new Tile([TILE_PLAYER]));
        this.player.position = new Position(52, 50);
    }

    loadPlayer(): Promise<any> {
        return new Promise((resolve, reject) => {
                               resolve(true);
                           }
        );
    }

}
