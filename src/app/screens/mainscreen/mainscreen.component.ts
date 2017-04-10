import {Component, HostListener, OnInit} from '@angular/core';
import {Entity} from "../../classes/entity";
import {EntitiesService} from "../../services/entities/entities.service";
import {MovementSystem} from "app/systems/movement.system";
import {RenderableSystem} from "../../systems/renderable.system";
import {PlayerService} from "../../services/player/player.service";
import {ScenegraphService} from "app/services/scene-graph/scenegraph.service";
import {MapsService} from "app/services/maps/maps.service";
import {TilesLoaderService} from "../../services/tiles/tiles.service";
import {KeyboardinputSystem} from "../../systems/keyboardinput.system";
import {RenderableBehavior} from "../../behaviors/renderable-behavior";
import {Tile} from "../../classes/tile";
import {PositionBehavior} from "../../behaviors/position-behavior";
import {Position} from "../../classes/position";
import {MovableBehavior} from "../../behaviors/movable-behavior";
import {KeycontrolBehavior} from "../../behaviors/keycontrol-behavior";

const MAX_WIDTH = 10;
const MAX_HEIGHT = 10;

@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.component.html',
  styleUrls: ['./mainscreen.component.css']
})
export class MainscreenComponent implements OnInit {
  isMapReady: boolean = false;
  gameLoop: any;

  @HostListener("document:keyup", ["$event"]) handleKeyboardEvents($event: KeyboardEvent) {
    this.processKeyInput($event);
  }

  constructor(private _entitiesService: EntitiesService,
              private _movementSystem: MovementSystem,
              private _renderableSystem: RenderableSystem,
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
        this.mainLoop();
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
            /*let ennemy = new Entity();
            ennemy.addBehavior(new RenderableBehavior(new Tile([45])));
            ennemy.addBehavior(new PositionBehavior(new Position(50, 50)));
            ennemy.addBehavior(new MovableBehavior());
            ennemy.addBehavior(new KeycontrolBehavior(ennemy));
            this._entitiesService.addEntity(ennemy);*/
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
      this._renderableSystem.processTick();
    }, 1000);
  }

  stopLoop() {
    window.clearInterval(this.gameLoop);
  }
}