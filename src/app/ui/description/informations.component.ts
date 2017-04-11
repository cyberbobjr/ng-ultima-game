import {Component, OnInit} from "@angular/core";
import {InformationsService} from "../../services/informations/informations.service";

@Component({
               selector: "app-game-informations",
               templateUrl: "./informations.component.html",
               styleUrls: ["./informations.component.css"]
           })
export class InformationsComponent implements OnInit {
    informationsTexts: Array<string> = [];

    constructor(private _informationsService: InformationsService) {
        this._informationsService.informationsText$.subscribe((information: string) => {
            this.informationsTexts.push(information);
            this._purgeInformationsTexts();
        });
    }

    ngOnInit() {
    }

    private _purgeInformationsTexts() {
        if (this.informationsTexts.length > 10) {
            this.informationsTexts.shift();
        }
    }
}
