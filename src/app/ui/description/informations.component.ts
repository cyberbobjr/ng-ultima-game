import {Component, NgZone, OnInit} from "@angular/core";
import {DescriptionsService} from "../../services/descriptions/descriptions.service";

@Component({
               selector: "app-game-informations",
               templateUrl: "./informations.component.html",
               styleUrls: ["./informations.component.css"]
           })
export class InformationsComponent implements OnInit {
    informationsTexts: Array<string> = [];

    constructor(private _informationsService: DescriptionsService) {
        this._informationsService.informationsText$.subscribe((information: string) => {
            this.informationsTexts.push(information);
            this._purgeInformationsTexts();
        });
    }

    ngOnInit() {
    }

    private _purgeInformationsTexts() {
        if (this.informationsTexts.length > 9) {
            this.informationsTexts.shift();
        }
    }
}
