import {IBehavior} from "../interfaces/IBehavior";

export class Entity {
    name: string;
    private _behaviors: Map<string, IBehavior> = new Map();

    constructor() {
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
}
