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
import {ITile} from "../../interfaces/ITile";
import {AiMovementBehavior} from "../../behaviors/ai-movement-behavior";
import {DescriptionBehavior} from "../../behaviors/description-behavior";
import {TravelcityBehavior} from "../../behaviors/travelcity-behavior";
import {CollideBehavior} from "../../behaviors/collide-behavior";
import {TalkBehavior} from "../../behaviors/talk-behavior";
import {InventoryBehavior} from "../../behaviors/inventory-behavior";
import {PartyBehavior} from "../../behaviors/party-behavior";
import {PartyService} from "../party/party.service";

@Injectable()
export class EntityFactoryService {
    player: Entity = null;

    constructor(private _tileloaderService: TilesLoaderService,
                private _partyService: PartyService) {
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
                this.player.addBehavior(new DescriptionBehavior());
                this.player.addBehavior(new CollideBehavior());
                this.player.addBehavior(new TravelcityBehavior());
                this.player.addBehavior(new TalkBehavior(this.player));
                this.player.addBehavior(new InventoryBehavior());
                this.player.addBehavior(new PartyBehavior(this.player, this._partyService));
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

    createNpc(position: Position, tileId: number, name: string, movementType: number): Entity {
        let newEntity: Entity = new Entity(name);
        let tile: ITile = this._tileloaderService.getTileByIndex(tileId);
        newEntity.addBehavior(new RenderableBehavior(tile));
        newEntity.addBehavior(new PositionBehavior(position));
        newEntity.addBehavior(new MovableBehavior());
        newEntity.addBehavior(new CollideBehavior());
        newEntity.addBehavior(new AiMovementBehavior(newEntity, movementType));
        return newEntity;
    }
}
