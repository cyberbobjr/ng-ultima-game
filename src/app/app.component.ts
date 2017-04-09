import {Component, HostListener, OnInit} from "@angular/core";
import {MapsService} from "./services/maps/maps.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {TilesLoaderService} from "./services/tiles/tiles.service";
import {PlayerService} from "./services/player/player.service";
import {EntitiesService} from "./services/entities/entities.service";
import {KeyboardinputSystem} from "./systems/keyboardinput.system";
import {Entity} from "./classes/entity";
import {MovementSystem} from "./systems/movement.system";
const MAX_WIDTH = 10;
const MAX_HEIGHT = 10;

@Component({
               selector: "app-root",
               templateUrl: "./app.component.html",
               styleUrls: ["./app.component.css"],
           })
export class AppComponent implements OnInit {
    isMapReady: boolean = false;
    gameLoop: any;
    @HostListener("document:keyup", ["$event"]) handleKeyboardEvents($event: KeyboardEvent) {
        this.processKeyInput($event);
    }

    constructor(private _entitiesService: EntitiesService,
                private _movementSystem: MovementSystem,
                private _playerService: PlayerService,
                private _mapService: MapsService,
                private _sceneService: ScenegraphService,
                private _tileService: TilesLoaderService,
                private _keyboardinputSystem: KeyboardinputSystem) {

    }

    ngOnInit() {
        this.initGame()
            .then(() => {
                this.isMapReady = true;
            });
    }

    initGame() {
        return Promise.all([
                               this._mapService.loadMap("assets/maps/world.map"),
                               this._tileService.loadTiles(),
                           ])
                      .then(() => {
                          console.log("Init game loaded");
                          this._playerService.loadPlayer()
                              .then((player: Entity) => {
                                  this._entitiesService.addEntity(player);
                                  this._sceneService.loadMap(this._mapService.currentMap);
                                  this._sceneService.setMaxVisibleColsAndRows(MAX_WIDTH, MAX_HEIGHT);
                                  this._sceneService.setCenterCameraOnEntity(player);
                              });
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
            this._sceneService.refresh();
        }, 3000);
    }

    stopLoop() {
        window.clearInterval(this.gameLoop);
    }
}
