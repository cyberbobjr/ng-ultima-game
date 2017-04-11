import {Injectable} from "@angular/core";
import {Position} from "../classes/position";
import {Entity} from "../classes/entity";
import {EntitiesService} from "../services/entities/entities.service";
import {PositionBehavior} from "../behaviors/position-behavior";
import * as _ from "lodash";
import {RenderableBehavior} from "../behaviors/renderable-behavior";
import {ITile} from "../interfaces/ITile";

@Injectable()
export class RenderableSystem {
    constructor(private _entities: EntitiesService) {
    }

    getRenderableTilesAtPosition(position: Position): Array<ITile> {
        let entities: Array<ITile> = [];
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("renderable") && entity.hasBehavior("position")) {
                let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                if (_.isEqual(positionBehavior.position, position)) {
                    let renderableBehavior = <RenderableBehavior>entity.getBehavior("renderable");
                    entities.push(renderableBehavior.getTile());
                }
            }
        });
        return entities;
    }

    processTick() {
        this._entities.entities.forEach((entity: Entity) => {
            if (entity.hasBehavior("renderable")) {
                let renderableBehavior = <RenderableBehavior>entity.getBehavior("renderable");
                renderableBehavior.tick();
            }
        });
    }
}
