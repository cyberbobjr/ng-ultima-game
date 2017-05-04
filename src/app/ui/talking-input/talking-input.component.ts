import {AfterViewInit, Component, Directive, ElementRef, OnInit, ViewChild} from "@angular/core";
import {TalkingService} from "../../services/talking/talking.service";
import {DescriptionsService} from "../../services/descriptions/descriptions.service";
import {Entity} from "../../classes/entity";
import * as _ from "lodash";

@Directive({
    selector: "[autoFocus]"
})
export class FocusInput implements AfterViewInit {
    private firstTime: boolean = true;

    constructor(public elem: ElementRef) {
    }

    ngAfterViewInit() {
        if (this.firstTime) {
            this.elem.nativeElement.focus();
            this.firstTime = false;
        }
    }
}

@Component({
    selector: "app-talking-input",
    templateUrl: "talking-input.component.html",
    styleUrls: ["talking-input.component.css"],
})

export class TalkingInputComponent implements OnInit {
    @ViewChild("inputText") inputText: ElementRef;
    _displayInput: boolean = false;

    constructor(private _talkingService: TalkingService,
                private _descriptionService: DescriptionsService) {
    }

    ngOnInit() {
        this._talkingService.talker$.subscribe((entity: Entity) => {
            this._displayInput = !(_.isNull(entity));
        });
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
