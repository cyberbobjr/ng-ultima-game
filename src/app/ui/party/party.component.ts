import {Component, OnInit} from "@angular/core";
import {PartyService} from "../../services/party/party.service";
import {Entity} from "../../classes/entity";

@Component({
               selector: "app-party",
               templateUrl: "./party.component.html",
               styleUrls: ["./party.component.css"]
           })
export class PartyComponent implements OnInit {
    party: Array<Entity> = [];

    constructor(private _partyService: PartyService) {
        this._partyService.party$.subscribe((party: Array<Entity>) => {
            this.party = party;
        });
    }

    ngOnInit() {
    }

}
