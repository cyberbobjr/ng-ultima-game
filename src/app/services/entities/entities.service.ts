import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {Position} from "../../classes/position";

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
}
