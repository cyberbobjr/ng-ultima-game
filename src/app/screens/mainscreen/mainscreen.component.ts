import {Component, HostListener, OnInit} from "@angular/core";
import {Entity} from "../../classes/entity";
import {EntitiesService} from "../../services/entities/entities.service";
import {MovementSystem} from "app/systems/movement.system";
import {RenderableSystem} from "../../systems/renderable.system";
import {EntityFactoryService} from "../../services/entityFactory/entityFactory.service";
import {ScenegraphService} from "app/services/scene-graph/scenegraph.service";
import {KeyboardinputSystem} from "../../systems/keyboardinput.system";
import {SavestateSystem} from "../../systems/savestate.system";
import {DescriptionsService} from "../../services/descriptions/descriptions.service";
import {PartyService} from "../../services/party/party.service";
import {ActivatedRoute} from "@angular/router";
import {AiSystem} from "../../systems/ai.system";

@Component({
    selector: "app-mainscreen",
    templateUrl: "./mainscreen.component.html",
    styleUrls: ["./mainscreen.component.css"]
})
export class MainscreenComponent implements OnInit {
    isMapReady: boolean = false;
    gameLoop: any;

    @HostListener("document:keyup", ["$event"]) handleKeyboardEvents($event: KeyboardEvent) {
        this.processKeyInput($event);
    }

    constructor(private route: ActivatedRoute,
                private _entitiesService: EntitiesService,
                private _movementSystem: MovementSystem,
                private _renderableSystem: RenderableSystem,
                private _playerService: EntityFactoryService,
                private _sceneService: ScenegraphService,
                private _keyboardinputSystem: KeyboardinputSystem,
                private _savestateSystem: SavestateSystem,
                private _informationsService: DescriptionsService,
                private _aiSystem: AiSystem) {
    }

    ngOnInit() {
        this.initGame()
            .then(() => {
                this._informationsService.addLogInformation("init game loaded");
                this.isMapReady = true;
                this.mainLoop();
            });
    }

    initGame() {
        return this._playerService.createOrLoadPlayer()
                   .then((player: Entity) => {
                       let positionPlayer = player.getPosition();
                       this._entitiesService.addPlayer(player);
                       this._sceneService.setCenterCameraOnEntity(player);
                       return this._sceneService.setMapForEntity(player, positionPlayer);
                   });
    }

    processKeyInput($event: KeyboardEvent) {
        this._keyboardinputSystem.processKeyboardInput($event);
        this._movementSystem.processMovementsBehavior();
        this._sceneService.refresh();
    }

    mainLoop() {
        this.gameLoop = window.setInterval(() => {
            this._savestateSystem.processTick();
            this._renderableSystem.processTick();
            this._aiSystem.processAiBehavior();
            this._movementSystem.processMovementsBehavior();
            this._sceneService.refresh();
        }, 250);
    }

    stopLoop() {
        window.clearInterval(this.gameLoop);
    }
}
