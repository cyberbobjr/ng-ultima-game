import {Component, HostListener, OnInit} from "@angular/core";
import {Entity} from "../../classes/entity";
import {EntitiesService} from "../../services/entities/entities.service";
import {MovementSystem} from "app/systems/movement.system";
import {RenderableSystem} from "../../systems/renderable.system";
import {EntityFactoryService} from "../../services/entityFactory/entityFactory.service";
import {ScenegraphService} from "app/services/scene-graph/scenegraph.service";
import {MapsService} from "app/services/maps/maps.service";
import {KeyboardinputSystem} from "../../systems/keyboardinput.system";
import {SavestateSystem} from "../../systems/savestate.system";
import {DescriptionsService} from "../../services/informations/descriptions.service";
import {PartyService} from "../../services/party/party.service";
import {ActivatedRoute} from "@angular/router";
import {GameMap} from "../../classes/game_map";
const MAX_WIDTH = 10;
const MAX_HEIGHT = 10;

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
                private _mapService: MapsService,
                private _sceneService: ScenegraphService,
                private _keyboardinputSystem: KeyboardinputSystem,
                private _savestateSystem: SavestateSystem,
                private _informationsService: DescriptionsService,
                private _partyService: PartyService) {
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
                       let positionPlayer = this._entitiesService.getPositionOfEntity(player);
                       this._entitiesService.addEntity(player);
                       this._partyService.addMember(player);
                       this._sceneService.setCenterCameraOnEntity(player);
                       return this._mapService.loadMapByMapId(positionPlayer.mapId);
                   })
                   .then((currentMap: GameMap) => {
                       this._sceneService.setMap(currentMap);
                       this._sceneService.setMaxVisibleColsAndRows(MAX_WIDTH, MAX_HEIGHT);
                       return true;
                   });
    }

    processKeyInput($event: KeyboardEvent) {
        this._keyboardinputSystem.processKeyboardInput($event);
        this._movementSystem.processMovementsBehavior();
        this._sceneService.refresh();
    }

    /**
     * @TODO : code a tick function instead of refresh sceneService
     */
    mainLoop() {
        this.gameLoop = window.setInterval(() => {
            this._renderableSystem.processTick();
            this._savestateSystem.processTick();
        }, 1000);
    }

    stopLoop() {
        window.clearInterval(this.gameLoop);
    }
}
