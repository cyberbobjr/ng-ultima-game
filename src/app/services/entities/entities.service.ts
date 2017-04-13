import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {Position} from "../../classes/position";
import * as _ from "lodash";
import {ITile} from "../../interfaces/ITile";
import {RenderableBehavior} from "../../behaviors/renderable-behavior";

@Injectable()
export class EntitiesService {
    entities: Array<Entity> = [];

    constructor() {
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    getPositionOfEntity(entity: Entity): Position {
        let positionBehavior = <PositionBehavior>entity.getBehavior("position");
        return positionBehavior.position;
    }

    getEntitiesAtPosition(position: Position): Array<Entity> {
        return _.filter(this.entities, (entity: Entity) => {
            if (entity.hasBehavior("position")) {
                let positionBehavior = <PositionBehavior>entity.getBehavior("position");
                return positionBehavior.position.isEqual(position);
            }
            return false;
        });
    }

    getEntitiesTiles(entities: Array<Entity>): Array<ITile> {
        let entitiesTiles: Array<ITile> = [];
        entitiesTiles = _.map(entities, (entity: Entity) => {
            if (entity.hasBehavior("renderable")) {
                return this._getRenderableTile(entity);
            }
        });
        return entitiesTiles;
    }

    private _getRenderableTile(entity: Entity): ITile {
        let renderableBehavior = <RenderableBehavior>entity.getBehavior("renderable");
        return renderableBehavior.getTile();
    }
}
