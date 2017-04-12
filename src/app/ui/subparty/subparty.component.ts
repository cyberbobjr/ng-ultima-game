import {Component, Input, OnInit} from "@angular/core";
import {Entity} from "../../classes/entity";
import {HealthBehavior} from "../../behaviors/health-behavior";

@Component({
               selector: "app-subparty",
               templateUrl: "./subparty.component.html",
               styleUrls: ["./subparty.component.css"]
           })
export class SubpartyComponent implements OnInit {
    @Input("partymember") partymember: Entity;
    @Input("index") index: number;
    health: number = null;

    constructor() {
    }

    ngOnInit() {
        this.health = this._extractHealthPoint();
    }

    private _extractHealthPoint(): number {
        if (this.partymember.hasBehavior("health")) {
            let healthBehavior = <HealthBehavior>this.partymember.getBehavior("health");
            return healthBehavior.getHealth();
        }
    }
}
