import {Component, OnInit} from "@angular/core";
import {MapsService} from "./services/maps/maps.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {TilesLoaderService} from "./services/tiles/tiles.service";
import {PlayerService} from "./services/player/player.service";
import {ActorsService} from "./services/actors/actors.service";
import {Hotkey, HotkeysService} from "angular2-hotkeys";
const MAX_WIDTH = 10;
const MAX_HEIGHT = 10;

@Component({
               selector: "app-root",
               templateUrl: "./app.component.html",
               styleUrls: ["./app.component.css"]
           })
export class AppComponent implements OnInit {
    isMapReady: boolean = false;
    gameLoop: any;

    constructor(private _actorsService: ActorsService,
                private _playerService: PlayerService,
                private _mapService: MapsService,
                private _sceneService: ScenegraphService,
                private _tileService: TilesLoaderService,
                private _hotkeyService: HotkeysService) {

    }

    ngOnInit() {
        this.initGame()
            .then(() => {
                this.initHotkey();
                this.isMapReady = true;
                this.mainLoop();
            });
    }

    initGame() {
        return Promise.all([
                               this._mapService.loadMap("assets/maps/world.map"),
                               this._tileService.loadTiles(),
                               this._playerService.loadPlayer()
                           ])
                      .then(() => {
                          console.log("Init game loaded");
                          this._actorsService.addActor(this._playerService.player);
                          this._sceneService.loadMap(this._mapService.currentMap);
                          this._sceneService.setMaxVisibleColsAndRows(MAX_WIDTH, MAX_HEIGHT);
                          this._sceneService.setCenterCameraOnEntity(this._playerService.player);
                      });
    }

    /**
     * For Testing purpose
     */
    initHotkey() {
        this._hotkeyService.add(new Hotkey("up", (event: KeyboardEvent): boolean => {
            this._playerService.player.moveUp();
            this._sceneService.refresh();
            return false;
        }));
        this._hotkeyService.add(new Hotkey("down", (event: KeyboardEvent): boolean => {
            this._playerService.player.moveDown();
            this._sceneService.refresh();
            return false;
        }));
        this._hotkeyService.add(new Hotkey("left", (event: KeyboardEvent): boolean => {
            this._playerService.player.moveLeft();
            this._sceneService.refresh();
            return false;
        }));
        this._hotkeyService.add(new Hotkey("right", (event: KeyboardEvent): boolean => {
            this._playerService.player.moveRight();
            this._sceneService.refresh();
            return false;
        }));
        this._hotkeyService.add(new Hotkey("esc", (event: KeyboardEvent): boolean => {
            this.stopLoop();
            return false;
        }));
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
