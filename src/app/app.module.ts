import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import {AppComponent} from "./app.component";
import {MapCmpComponent} from "./ui/map-cmp/map-cmp.component";
import {MapsService} from "./services/maps/maps.service";
import {TilesLoaderService} from "./services/tiles/tiles.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {PlayerService} from "./services/player/player.service";
import {ActorsService} from "./services/actors/actors.service";

@NgModule({
              declarations: [
                  AppComponent,
                  MapCmpComponent
              ],
              imports: [
                  BrowserModule,
                  FormsModule,
                  HttpModule
              ],
              providers: [MapsService,
                          TilesLoaderService,
                          ScenegraphService,
                          PlayerService,
                          ActorsService
              ],
              bootstrap: [AppComponent]
          })
export class AppModule {
}
