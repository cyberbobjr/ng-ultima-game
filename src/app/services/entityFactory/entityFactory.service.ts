import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Position} from "../../classes/position";
import {RenderableBehavior} from "../../behaviors/renderable-behavior";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {MovableBehavior} from "../../behaviors/movable-behavior";
import {KeycontrolBehavior} from "../../behaviors/keycontrol-behavior";
import {TilesLoaderService} from "../tiles/tiles.service";
import {SavestateBehavior} from "../../behaviors/savestate-behavior";
import {HealthBehavior} from "../../behaviors/health-behavior";

@Injectable()
export class EntityFactoryService {

  player: Entity = null;

  constructor(private _tileloaderService: TilesLoaderService) {
  }

  createOrLoadPlayer(): Promise<Entity> {
    return new Promise((resolve, reject) => {
        this.player = new Entity("Avatar");
        this.player.addBehavior(new RenderableBehavior(this._tileloaderService.getTileByName("avatar")));
        this.player.addBehavior(new PositionBehavior(this._getEntityPosition("player")));
        this.player.addBehavior(new HealthBehavior(100));
        this.player.addBehavior(new MovableBehavior());
        this.player.addBehavior(new SavestateBehavior("player"));
        this.player.addBehavior(new KeycontrolBehavior());
        resolve(this.player);
      }
    );
  }

  private _getEntityPosition(entityName: string): Position {
    let entityPosition = this._getEntityPositionInStorage(entityName);
    if (!entityPosition) {
      entityPosition = new Position(104, 85);
    } else {
      entityPosition = new Position(entityPosition.row, entityPosition.col, entityPosition.mapId);
    }
    return entityPosition;
  }

  private _getEntityPositionInStorage(entityName: string): Position | null {
    return <Position>(new SavestateBehavior(entityName)).loadKey("position");
  }
}
