import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import {AppComponent} from "./app.component";
import {MapCmpComponent} from "./ui/map-cmp/map-cmp.component";
import {MapsService} from "./services/maps/maps.service";
import {TilesService} from "./services/tiles/tiles.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";

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
                          TilesService,
                          ScenegraphService],
              bootstrap: [AppComponent]
          })
export class AppModule {
}
