import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Position} from "../../classes/position";
import {Tile} from "../../classes/tile";
import {RenderableBehavior} from "../../behaviors/renderable-behavior";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {MovableBehavior} from "../../behaviors/movable-behavior";
import {KeycontrolBehavior} from "../../behaviors/keycontrol-behavior";
import {TilesLoaderService} from "../tiles/tiles.service";

const TILE_PLAYER = 31;

@Injectable()
export class PlayerService {

    player: Entity = null;

    constructor(private _tileloaderService: TilesLoaderService) {
    }

    loadPlayer(): Promise<Entity> {
        return new Promise((resolve, reject) => {
                               this.player = new Entity();
                               this.player.addBehavior(new RenderableBehavior(this._tileloaderService.getTileByName("avatar")));
                               this.player.addBehavior(new PositionBehavior(new Position(52, 50)));
                               this.player.addBehavior(new MovableBehavior());
                               this.player.addBehavior(new KeycontrolBehavior(this.player));
                               resolve(this.player);
                           }
        );
    }

}
