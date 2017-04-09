import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";

@Injectable()
export class EntitiesService {
    entities: Array<Entity> = [];

    constructor() {
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

}
