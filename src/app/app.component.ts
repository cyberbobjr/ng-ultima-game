import {Component, OnInit} from "@angular/core";
import {MapsService} from "./services/maps/maps.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {TilesLoaderService} from "./services/tiles/tiles.service";
import {PlayerService} from "./services/player/player.service";
import {ActorsService} from "./services/actors/actors.service";
const MAX_WIDTH = 10;
const MAX_HEIGHT = 10;

@Component({
               selector: "app-root",
               templateUrl: "./app.component.html",
               styleUrls: ["./app.component.css"]
           })
export class AppComponent implements OnInit {
    isMapReady: boolean = false;

    constructor(private _actorsService: ActorsService,
                private _playerService: PlayerService,
                private _mapService: MapsService,
                private _sceneService: ScenegraphService,
                private _tileService: TilesLoaderService) {

    }

    ngOnInit() {
        this.initGame();
    }

    initGame() {
        Promise.all([
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
                   this.isMapReady = true;
                   this.mainLoop();
               });
    }

    mainLoop() {
        window.setTimeout(() => {
            this._playerService.player.position.col++;
            this._sceneService.refresh();
        }, 3000);
    }
}
