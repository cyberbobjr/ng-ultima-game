import {IBehavior} from "../interfaces/IBehavior";
import {Entity} from "../classes/entity";
import {MovableBehavior} from "./movable-behavior";
import {Position} from "../classes/position";
import {PositionBehavior} from "./position-behavior";
import * as _ from "lodash";

const WANDER_MVT = 0;
const TIMER_INTERVAL_SECONDS = 2000;
export enum movementType {
    fixed = 0,
    wander,
    follow,
    attack
}

export class AiMovementBehavior implements IBehavior {
    name = "aimovement";
    movementType: movementType = movementType.fixed;
    actor: Entity = null;
    lastPerformanceNow: number = 0;
    private _movementTypeBackup: movementType;

    constructor(actor: Entity, movemenType: number) {
        this.actor = actor;
        this.movementType = movemenType;
    }

    tick(PerformanceNow: number) {
        if (PerformanceNow - this.lastPerformanceNow > TIMER_INTERVAL_SECONDS) {
            if (this.actor.hasBehavior("movable") && this.actor.hasBehavior("position") && this.movementType === movementType.wander) {
                this._randomMove();
            }
            this.lastPerformanceNow = PerformanceNow;
        }
    }

    private _randomMove() {
        let movementBehavior = <MovableBehavior>this.actor.getBehavior("movable");
        let positionBehavior = <PositionBehavior>this.actor.getBehavior("position");
        movementBehavior.vector = new Position(this._random(-1, 1), this._random(-1, 1), positionBehavior.position.mapId);
    }

    private _random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    stopAiMovement() {
        this._movementTypeBackup = _.clone(this.movementType);
        this.movementType = movementType.fixed;
    }

    resumeAiMovement() {
        this.movementType = this._movementTypeBackup;
    }
}
