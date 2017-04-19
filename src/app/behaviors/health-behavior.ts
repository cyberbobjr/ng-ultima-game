import {IBehavior} from "../interfaces/IBehavior";

export class HealthBehavior implements IBehavior {
    name = "health";
    _currentHealth: number = 0;
    _maxHealth: number;

    constructor(health: number) {
        this._maxHealth = health;
        this._currentHealth = health;
    }

    tick(PerformanceNow: number) {

    }

    takeDamages(numberOfDamage: number) {
        this._currentHealth -= numberOfDamage;
    }

    restoreHealth(restoreNumber: number) {
        this._currentHealth += restoreNumber;
    }

    getHealth(): number {
        return this._currentHealth;
    }
}
