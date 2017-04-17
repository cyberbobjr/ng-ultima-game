import {IBehavior} from "../interfaces/IBehavior";
import {PositionBehavior} from "../behaviors/position-behavior";
import {Position} from "../classes/position";

export class Entity {
    name: string;
    private _behaviors: Map<string, IBehavior> = new Map();

    constructor(entityName?: string) {
        if (entityName) {
            this.name = entityName;
        }
    }

    addBehavior(behavior: IBehavior) {
        this._behaviors.set(behavior.name, behavior);
    }

    removeBehavior(behaviorName: string) {
        return this._behaviors.delete(behaviorName);
    }

    hasBehavior(behaviorName: string): boolean {
        return this._behaviors.has(behaviorName);
    }

    getBehavior(behaviorName: string): IBehavior {
        return this._behaviors.get(behaviorName);
    }

    getPosition(): Position {
        let positionBehavior = <PositionBehavior>this.getBehavior("position");
        return positionBehavior.position;
    }
}
