import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Position} from "../../classes/position";
import {RenderableBehavior} from "../../behaviors/renderable-behavior";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {MovableBehavior} from "../../behaviors/movable-behavior";
import {KeycontrolBehavior} from "../../behaviors/keycontrol-behavior";
import {TilesLoaderService} from "../tiles/tiles.service";
import {SavestateBehavior} from "../../behaviors/savestate-behavior";

@Injectable()
export class PlayerService {

    player: Entity = null;

    constructor(private _tileloaderService: TilesLoaderService) {
    }

    loadPlayer(): Promise<Entity> {
        return new Promise((resolve, reject) => {
                               this.player = new Entity();
                               this.player.addBehavior(new RenderableBehavior(this._tileloaderService.getTileByName("avatar")));
                               this.player.addBehavior(new PositionBehavior(this._setPlayerPosition()));
                               this.player.addBehavior(new MovableBehavior());
                               this.player.addBehavior(new SavestateBehavior("player"));
                               this.player.addBehavior(new KeycontrolBehavior(this.player));
                               resolve(this.player);
                           }
        );
    }

    private _setPlayerPosition(): Position {
        let playerPosition = this._getPlayerPositionInStorage();
        if (!playerPosition) {
            playerPosition = new Position(104, 85);
        } else {
            playerPosition = new Position(playerPosition.row, playerPosition.col);
        }
        return playerPosition;
    }

    private _getPlayerPositionInStorage(): Position | null {
        return <Position>(new SavestateBehavior("player")).loadKey("position");
    }
}
