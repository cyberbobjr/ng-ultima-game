import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {TalkingService} from "../../services/talking/talking.service";
import {DescriptionsService} from "../../services/descriptions/descriptions.service";

@Component({
    selector: "app-talking-input",
    templateUrl: "talking-input.component.html",
    styleUrls: ["talking-input.component.css"]
})

export class TalkingInputComponent implements OnInit {
    @ViewChild("inputText") inputText: ElementRef;

    constructor(private _talkingService: TalkingService,
                private _descriptionService: DescriptionsService) {
    }

    ngOnInit() {
    }

    submitTalk(event) {
        event.preventDefault();
        let answer = this._talkingService.parseInputTalking(this.inputText.nativeElement.value);
        this._descriptionService.addTextToInformation(this.inputText.nativeElement.value, "yellow");
        this._descriptionService.addTextToInformation(answer);
        this.clearTalk();
    }

    clearTalk() {
        this.inputText.nativeElement.value = null;
    }
}
