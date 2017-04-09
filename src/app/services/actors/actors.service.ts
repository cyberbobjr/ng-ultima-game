import {Injectable} from "@angular/core";
import {Entity} from "../../classes/entity";
import {Position} from "../../classes/position";

@Injectable()
export class ActorsService {
    actors: Array<Entity> = [];

    constructor() {
    }

    addActor(entity: Entity) {
        this.actors.push(entity);
    }

    getActorsAtPosition(position: Position): Array<Entity> {
        return this.actors.filter((actor: Entity) => {
            return (actor.position.col === position.col && actor.position.row === position.row);
        });
    }
}
