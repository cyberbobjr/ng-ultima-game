import {Component, OnInit} from "@angular/core";
import {MapsService} from "./services/maps/maps.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {Position} from "./classes/position";
import {TilesService} from "./services/tiles/tiles.service";
import {PlayerService} from "./services/player/player.service";

@Component({
               selector: "app-root",
               templateUrl: "./app.component.html",
               styleUrls: ["./app.component.css"]
           })
export class AppComponent implements OnInit {
    isMapReady: boolean = false;

    constructor(private _playerService: PlayerService, private _mapService: MapsService, private _sceneService: ScenegraphService, private _tileService: TilesService) {

    }

    ngOnInit() {
        this.initGame();
    }

    initGame() {
        Promise.all([
                        this._mapService.loadWordlMap(),
                        this._tileService.loadTiles(),
                        this._playerService.loadPlayer()
                    ])
               .then(() => {
                   console.log("Init game loaded");
                   this._sceneService.loadScene(this._mapService.currentMap, new Position(45, 45));
                   this._sceneService.addActor(this._playerService.player);
                   this.isMapReady = true;
               });
    }
}
